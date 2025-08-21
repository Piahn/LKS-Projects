import express from "express";
import cors from "cors";
import bodyparser from "body-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";

dotenv.config();
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
