import { AuthError } from "../util/error/exceptions";
import Client from "./db_init";
import ModelDirector from "./director";
import UserType from "../../types/user.types";
import { ValidatePasswordKeyType } from "../../types/auth.types";

class UserQueries {
  public async updatePassword(mode: UserType.PasswordUpdate.IMode) {
    switch (mode.state) {
      case UserType.PasswordUpdate.State.USING_EXISTING_PASSWORD:
        await ModelDirector.ContextInstance.Auth.validatePassword(mode.userId, ValidatePasswordKeyType.USER_ID, mode.old, "Invalid password, try again!");

        await Client
          .updateTable("User")
          .set({
            password_hash: await ModelDirector.ContextInstance.Auth.generateHash(mode.updated)
          })
          .execute();
        break

      case UserType.PasswordUpdate.State.USING_OTP_EMAIL:
        break;
    };
  };

  public updateEmail(userId: string, email: string) {

  };

  public updateDescription(userId: string, description: string) {

  };

  public deleteUser(userId: string) {

  };
};

export default UserQueries;
