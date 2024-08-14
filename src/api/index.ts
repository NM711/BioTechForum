import ExpressJS from "express";
import CookieParser from "cookie-parser";
import BodyParser from "body-parser";
import UserEndpoint from "./src/controllers/user";
import SessionEndpoint from "./src/controllers/session";

function main() {
  const app = ExpressJS();

  app.use(BodyParser.json(), BodyParser.urlencoded({ extended: true }));
  app.use(CookieParser(process.env.COOKIE_SECRET as string));
 
  app.use(UserEndpoint, SessionEndpoint);
  
  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
  });
};

main();
