import { DatabaseError, HttpError } from "./exceptions";
import type { Response } from "express";

class Logger {
  public static LogDatabaseError(error: DatabaseError) {
    console.error({
      name: error.name,
      message: error.sqlMessage,
      codenumber: error.errno,
      codename: error.code,
      status: 500,
      date: new Date()
    });
  };

  public static LogError(name: string, message: string, httpStatus: number = 500) {
    console.error({
      name,
      message,
      status: httpStatus,
      date: new Date()
    });
  };
};

/**
  Util error reporter.
  @param generic - Generic error message for base error object
  @param error - Reference to error object
  @param res - Reference to response object
*/

function Reporter(generic: string, error: unknown, res: Response) {
  if (error instanceof HttpError) {
    Logger.LogError(error.name, error.message, error.status);
    res.statusCode = error.status;
    return res.json({ name: error.name, error: error.message });
  } else if (error instanceof DatabaseError) {
    Logger.LogDatabaseError(error);
    res.statusCode = 500;
    return res.json({ name: "Error", error: generic });
  } else if (error instanceof Error) {
    Logger.LogError(error.name, error.message);
    res.statusCode = 500;
    return res.json({ name: "Error", error: generic })
  };
};

export default Reporter;
