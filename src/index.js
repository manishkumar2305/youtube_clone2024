import dotenv from "dotenv";
import { app } from "./app.js";
import mongoDBConnection from "./database/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 5000;

mongoDBConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `✅ App listing on port: ${port} & url: http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.error("Mongodb connection failed ERROR: ", err);
  });
