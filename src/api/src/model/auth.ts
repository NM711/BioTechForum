import Crypto from "node:crypto";
import Client from "./db_init"
import { AuthError, DatabaseError } from "../util/error/exceptions";
import { NoResultError, ReferenceExpression } from "kysely";
import EmailTransporter from "./nodemail";
import OTPGenerator from "otp-generator";
import type { IMysqlError } from "../../types/exceptions.types";
import { ValidatePasswordKeyType } from "../../types/auth.types";
import DBStructure from "../../types/model";

class UserAuth {

  /**
    Generates a scrypt hash. Automatically inserts a crypto random 32 byte salt and 64 byte key length.
  */

  public async generateHash(password: string): Promise<string> {
    return new Promise((resolve) => {
      // we need a way to retrieve the salt when comparing the hashes, so we need to append the salt after some special char.
      const salt = Crypto.randomBytes(32).toString("hex");

      Crypto.scrypt(password, salt, 64, (err, derived) => {
        if (err) {
          throw err;
        } else {
          return resolve(salt + `$` + derived.toString("hex"));
        };
      });
    });
  };

  /**
    Compares one hash to a rehash of some other input source.
  
    @param storedHash - The hash that was stored in the database
    @param password  - The password we are going to use to hash and compare to the stored hash.
  */

  private async compareHash(storedHash: string, password: string) {
    const salt = storedHash.split("$")[0];

    if (!salt) {
      throw new Error("Provided hash does not have a valid salt!");
    };

    return new Promise((resolve) => {
      Crypto.scrypt(password, salt, 64, (err, derived) => {

        if (err) {
          return resolve(false);
        };

        const hash = salt + "$" + derived.toString("hex");
        return resolve(hash === storedHash);
      });
    });
  };

  /**
    Creates a new user in the database.
  */

  public async register(username: string, password: string) {
    const generatedUserID = Crypto.randomUUID() as string;
    const generatedHash = await this.generateHash(password);
    try {
      await Client
        .insertInto("User")
        .values({
          "id": generatedUserID,
          "username": username,
          "password_hash": generatedHash
        })
        .execute();
    } catch (e: unknown) {
      // the only error that could possibly occur here is the mysql error.

      const mysqlErrData = e as IMysqlError;

      switch (mysqlErrData.errno) {
        // ER_DUP_ENTRY
        case 1062:
          throw new AuthError(`Could not create account because username "${username}" has already been taken!`, 409);

        default:
          throw new DatabaseError(mysqlErrData);
      };
    };
  };

  public async generateSudoSession(username: string) {
    const { id: userId } = await Client
      .selectFrom("User")
      .select("id")
      .where("username", "=", username)
      .executeTakeFirstOrThrow();

    const { id: sessionId, expires_at: expires } = await Client
      .selectFrom("Session")
      .select(["id", "expires_at"])
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow()
  };

  /*
    Validates password or throws error
    @param key - A given key used to look for a "password_hash" within the "User" table. 
    @param type - The type of unique field that we are gonna use our "key" on.
    @param password - The provided password that we are gonna use for hash comparison.
    @param errmessg - Custom error message.
  */


  public async validatePassword(key: string, type: ValidatePasswordKeyType, password: string, errmessg: string) {
    // key type

    let kt: ReferenceExpression<DBStructure.Database, "User"> = "username";

    switch (type) {
      case ValidatePasswordKeyType.USERNAME:
        kt = "username";
        break;

      case ValidatePasswordKeyType.PASSWORD_HASH:
        kt = "password_hash";
        break;

      case ValidatePasswordKeyType.USER_ID:
        kt = "id";
        break;
    };

    const user = await Client
      .selectFrom("User")
      .selectAll()
      .where(kt, "=", key)
      .executeTakeFirstOrThrow();

    const isMatch = this.compareHash(user.password_hash, password);

    if (!isMatch) {
      throw new AuthError(errmessg, 401);
    };

    return user;
  };

  /**
    Validates user credentials and generates session cookie on success.
  */

  public async login(username: string, password: string) {
    // necessary in the event of a user inputting the wrong username and cant pull a hash out of db.
    // could help in making timing attacks harder.
    const hardcodedBackupHash = "ea28326f8e6bc4dd779ae95d26a763b553866ab29640f2ac7d9d533283f45048$0cc58be6aea290a8ae7fb3be6908e4bf810dc750357c3208f7fd07bee4e6a168e578d38da237a3b2701761bbee280d318a8f195dfeac9b74db88b02b2ad6f6d5"
    const genericErrMssg = "Credentials for username or password are incorrect, please try again!";

    try {
      const { password_hash: hash, id: userId } = await this.validatePassword(username, ValidatePasswordKeyType.USERNAME, password, genericErrMssg);
      return { session_id: await this.generateSession(userId), user_id: userId };

    } catch (error) {
      if (error instanceof NoResultError) {
        // hash anyways to make timing attacks harder.
        this.compareHash(hardcodedBackupHash, password);
        throw new AuthError(genericErrMssg, 401, error);
      } else if (error instanceof AuthError) {
        throw error;
      } else {
        throw new AuthError("Could not process credentials properly due to internal server error!", 500, error as Error);
      };
    };
  };

  /**
    Creates a session in the database and returns unhashed session id for further processing.
  */

  private async generateSession(userId: string) {
    const sessionId = Crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);

    // sha 1 the session id, this way we avoid leaking active session ids that, have not yet been deleted by the
    // event scheduler to insider attacks or unauthorized database access attacks.

    const sessionHash = Crypto.createHash("sha1").update(sessionId).digest("hex");

    try {
      await Client
        .insertInto("Session")
        .values({
          "id": sessionHash,
          "user_id": userId,
          "expires_at": expires
        })
        .execute();

    } catch (e) {

      const error = new DatabaseError(e as IMysqlError);

      // if its a duplicate entry error, just update the field.
      // if not a duplicate error, throw the DatabaseError and have it be caught and destructured at the top level.
      if (error.errno === 1062) {
        await Client
          .updateTable("Session")
          .set({
            "id": sessionHash,
            "expires_at": expires
          })
          .where("user_id", "=", userId)
          .execute();
      } else {
        throw error;
      };
    };

    return sessionId;
  };

  public async logout(sessionId: string) {
    const sessionHash = Crypto.createHash("sha1").update(sessionId).digest("hex");

    // make sure session exists, if doesnt throw error
    // delete session after confirming it exists

    const { numDeletedRows } = await Client
      .deleteFrom("Session")
      .where("id", "=", sessionHash)
      .executeTakeFirstOrThrow();

    if (numDeletedRows.toString() === "0") {
      throw new AuthError("Session to logout from does not exist!", 404);
    };
  };

  public async validateSession(sessionId: string, userId: string) {
    try {
      const { expires_at: expires } = await Client
        .selectFrom("Session")
        .select("expires_at")
        .where("id", "=", sessionId)
        .where("user_id", "=", userId)
        .executeTakeFirstOrThrow();

      if (new Date().getTime() > expires.getTime()) {
        throw new AuthError("Session has expired!", 401);
      };

    } catch (e: unknown) {
      if (e instanceof AuthError) {
        throw e
      };

      throw new AuthError("Session is invalid!", 401, e as Error);
    };
  };

  /*
    OTP generator that creates a new one time password entry within the database,
    once it expires it will no longer work and will be removed.
    It will also send the otp to the given user email.
  */

  public async generateOTP(userId: string, email: string) {
    const otp = OTPGenerator.generate(6);

    await Client
      .insertInto("OneTimePassword")
      .values({
        id: otp,
        user_id: userId
      })
      .execute();

    await EmailTransporter.sendMail({
      from: `Nathan over at "BioTechForums" <biopersonalproject@proton.me>`,
      to: email,
      subject: "One Time Password Sent For Verification!",
      text: `Your one time password is: ${otp}, make sure you do not share it with anyone!`
    });
  };

  /*
    Validates a provided OTP for a given user, if its expired it is auto deleted and an error is thrown.
    If no OTP is found for a specific user and provided string, an error is thrown.
  */

  public async validateOTP(userId: string, otp: string) {
    try {
      const { expires_at: expires } = await Client
        .selectFrom("OneTimePassword")
        .select(["expires_at"])
        .where("user_id", "=", userId)
        .where("id", "=", otp)
        .executeTakeFirstOrThrow();

      if (new Date().getTime() > expires.getTime()) {
        // delete the one time password and throw the error over
        await Client
          .deleteFrom("OneTimePassword")
          .where("user_id", "=", userId)
          .where("id", "=", otp)
          .execute();

        throw new AuthError("One time password is expired!", 401);
      };

    } catch (e: unknown) {
      if (e instanceof AuthError) {
        throw e
      };

      throw new AuthError("Invalid one time password provided!", 404, e as Error);
    };
  };

};


export default UserAuth;
