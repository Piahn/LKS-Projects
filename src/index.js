import express from "express";
import cors from "cors";
import bodyparser from "body-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import categoryRouter from "./routes/category.route.js";
import orderRouter from "./routes/order.route.js";
import couponRouter from "./routes/coupon.route.js";

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
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/orders", orderRouter);
app.use("/coupons", couponRouter);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
