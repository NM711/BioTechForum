import ModelDirector from "../model/director";
import { AuthError } from "../util/error/exceptions";
import type { Request, Response, NextFunction } from "express";

// #1 Validate the session_id via middleware
// #2 Validate that the given user_id is that of the actual user the session pertains to.
// #3 If not mark it as a violation and send an AuthError


export async function ValidateUserSession(req: Request, res: Response, next: NextFunction) {
  const genericError = "Could not accept request, missing auth fields!";
  try {
    const session: { id: string, user_id: string } = JSON.parse(req.signedCookies["session"]);

    if (!session.id || !session.user_id) {
      throw new AuthError(genericError, 401);
    };

    await ModelDirector.ContextInstance.Auth.validateSession(session.id, session.user_id, new Date())    
    next();
  } catch (e) {
    next(new AuthError(genericError, 401));
  };
};
