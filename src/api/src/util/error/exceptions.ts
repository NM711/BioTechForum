import { IMysqlError } from "../../../types/exceptions.types";

export class HttpError extends Error {
  public status: number;

  constructor(message: string, status: number, cause: null | Error = null) {
    super(message, { cause });
    this.name = "HttpError";
    this.status = status;
  };
};

export class AuthError extends HttpError {
  constructor(message: string, status: number, cause: null | Error = null) {
    super(message,  status, cause);
    this.name = "AuthenthicationError";
  };
};

/**
  Since a class does not seem to exist for this, I need to make my own to handle database errors at runtime when necessary.
*/

export class DatabaseError extends Error {
  public code: string;
  public errno: number;
  public sqlState: string;
  public sqlMessage: string;
  public sql: string;

  constructor(data: IMysqlError) {
    super(data.message, { cause: data.cause })
    this.code = data.code;
    this.errno = data.errno;
    this.sqlMessage = data.sqlMessage;
    this.sqlState = data.sqlState;
    this.sql = data.sql
  };
};
