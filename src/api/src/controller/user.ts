import Express from "express"
import ModelDirector from "../model/director";
import StrengthValidator from "../util/controller/user/strength_validators"
import Reporter from "../util/error/reporter";
import { ICredentials } from "../../types/auth.types";
import { AuthError, HttpError } from "../util/error/exceptions";
import UserType from "../../types/user.types"
import { ValidateUserSession } from "../middleware/validate";
const UserEndpoint = Express.Router();

const path = "/user"

UserEndpoint.post(path, async (req, res) => {
  try {
    const { username, password }: ICredentials = req.body;

    StrengthValidator.validateUseranme(username);
    StrengthValidator.validatePassword(password);

    await ModelDirector.ContextInstance.Auth.register(username, password);
    return res.json({ message: `Account successfully created for user "${username}"` });
  } catch (e) {
    return Reporter(`Account could not be created due to internal server error, please try again later!`, e, res);
  };
});

UserEndpoint.patch(path, ValidateUserSession, async (req, res) => {
  try {
    const updateState: UserType.UpdateState = req.body.update;
    const authState: UserType.PasswordUpdate.State = req.body.auth;

    switch (updateState) {
      case UserType.UpdateState.DESCRIPTION:
        const desc = req.body.content;

        if (!desc) {
          throw new HttpError(`Failed to update description, no content received!`, 400);
        };

        const description: string = req.body.content;
        const userId = req.signedCookies["user_id"];


      // return await ModelDirector.ContextInstance.User.updateDescription();

      case UserType.UpdateState.EMAIL:
      // if a user attempts to change an existing email, send an otp to his current email to confirm.
      // if a user doesnt have an email yet, allow him to add one without otp confirmation, do ask him for his password again though.

      case UserType.UpdateState.PASSWORD:
        switch (authState) {
          case UserType.PasswordUpdate.State.USING_EXISTING_PASSWORD:
          case UserType.PasswordUpdate.State.USING_OTP_EMAIL:
          default:
            throw new AuthError("You need to select a valid authenthication state, in order to be authorized to perform this action!", 401);
        }

      default:
        throw new HttpError(`Failed to update information for user, no state given!`, 400);

    };

  } catch (e) {
    return Reporter(`Could not update information for user due to internal server error!`, e, res);
  };
});

UserEndpoint.delete(path, ValidateUserSession);

export default UserEndpoint;
