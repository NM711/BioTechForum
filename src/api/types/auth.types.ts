export interface ICredentials {
  username: string;
  password: string;
};

export enum ValidatePasswordKeyType {
  USERNAME,
  PASSWORD_HASH,
  USER_ID
};
