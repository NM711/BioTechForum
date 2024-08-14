import { AuthError } from "../../error/exceptions"

class StrengthValidator {
  /**
    Will validate username strength, if the username does not meet the criteria an error will be thrown.
  */

  public static validateUseranme(username: string) {
    // Minimum username length is 8 and maximum length is to be 50

    if (username.length < 8) {
      throw new AuthError(`Usernames must be at least 8 characters long!`, 400);
    };

    if (username.length > 50) {
      throw new AuthError(`Usernames cannot exceed a 50 character limit!`, 400);
    };

    let totalDigits = 0;

    // Only special characters that can be used in a username are ["_", "-", ".", "!"]

    for (const char of username) {
      switch (true) {
        case /[a-zA-Z]/.test(char):
        case /[\\_\\-\\!\\.]/.test(char):
          continue;

        case /[0-9]/.test(char):
          ++totalDigits;
          break;

        default:
          throw new AuthError(`Invalid character found in username! (valid characters are only: [a-z][A-Z][0-9][-][_][!][.])`, 400);
      };
    };

    if (totalDigits < 3) {
      throw new AuthError(`Usernames must include at least 3 digits!`, 400);
    };
  };

  /**
    Will validate password strength, if the password does not meet the criteria an error will be thrown.
  */

  public static validatePassword(password: string) {

    if (password.length < 8) {
      throw new AuthError(`Password must be at least 8 characters in length!`, 400);
    };

    let totalDigits = 0;
    let totalLowerCase = 0;
    let totalUpperCase = 0;
    let totalSpecial = 0;

    // Only special characters that can be used in a username are ["_", "-", ".", "!"]

    for (const char of password) {
      switch (true) {
        case /[a-z]/.test(char):
          ++totalLowerCase;
          break;

        case /[A-Z]/.test(char):
          ++totalUpperCase;
          break;

        case /[0-9]/.test(char):
          ++totalDigits;
          break;

        // we suppose the rest are special characters, which can be included in passwords.

        default:
          ++totalSpecial;

      };
    };

    if (totalLowerCase < 1 || totalUpperCase < 1) {
      throw new AuthError(`Password must include at least 1 lowercase and 1 uppercase character!`, 400);
    };

    if (totalDigits < 3) {
      throw new AuthError(`Password must include at least 3 digits!`, 400);
    };

    if (totalSpecial < 1) {
      throw new AuthError(`Password must include at least 1 special character!`, 400);
    };
  };
};

export default StrengthValidator;
