namespace UserType {
  export enum UpdateState {
    DESCRIPTION,
    EMAIL,
    PASSWORD
  };

  export namespace PasswordUpdate {
    export enum State {
      NO_AUTH,
      USING_EXISTING_PASSWORD,
      USING_OTP_EMAIL
    };

    export interface IUsingExisting {
      userId: string;
      old: string;
      updated: string;
      state: State.USING_EXISTING_PASSWORD;
    };

    export interface IUsingOTP {
      userId: string;
      providedEmail: string;
      generatedOtp: string;
      providedOtp: string;
      updated: string;
      state: State.USING_OTP_EMAIL;
    };

    export type IMode = IUsingExisting | IUsingOTP; 
  };
};


export default UserType;
