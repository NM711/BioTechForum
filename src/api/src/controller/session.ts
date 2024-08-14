import Express from "express";
import ModelDirector from "../model/director";
import Reporter from "../util/error/reporter"
import { ICredentials } from "../../types/auth.types";
import { AuthError } from "../util/error/exceptions";
import { ValidateUserSession } from "../middleware/validate";
const SessionEndpoint = Express.Router();

const path = "/session"

SessionEndpoint.post(path, async (req, res) => {
  try {

    // Here a user could be granted a sudo session or alternatively a standard session

    const sessionType: "SUDO" | "STANDARD" = req.body.sessionType;

    switch (sessionType) {
      case "STANDARD": {
        const { username, password }: ICredentials = req.body;
        const { session_id, user_id } = await ModelDirector.ContextInstance.Auth.login(username, password);

        res.cookie("session", JSON.stringify({ id: session_id, user_id }), {
          maxAge: 8 * 24 * 60 * 60 * 1000,
          path: "/",
          httpOnly: true,
          signed: true,
        });

        return res.json({ message: `Successfully logged in as user "${username}"!` });
      };
        
      // case "SUDO": {

      //   const standardSessionId = req.body.standardSessionId;

      //   return
      // };


      default: {
        res.status(400);
        return res.send({ error: "Could not process request for invalid session type!" });
      };
    };
  } catch (error) {
    return Reporter("Could not process credentials properly due to internal server error!", error, res);
  };
});

SessionEndpoint.delete(path, ValidateUserSession, async (req, res) => {
  try {

    const { id: sessionId } = req.query;

    if (!sessionId) {
      throw new AuthError(`No valid "id" provided in request query!`, 400);
    };
    
    await ModelDirector.ContextInstance.Auth.logout(sessionId as string);
  } catch (error) {
    return Reporter("Could not process session logout due to internal server error!", error, res);
  }
});

export default SessionEndpoint;
