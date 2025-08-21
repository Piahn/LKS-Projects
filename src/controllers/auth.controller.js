import {
  registerUserSchema,
  loginUserSchema,
} from "../validators/user.validators.js";
import {
  registerUserService,
  loginUserService,
} from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const payload = req.body;

    await registerUserSchema.validateAsync(payload);

    const newUser = await registerUserService(payload);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    const statusCode = error.isJoi ? 400 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const payload = req.body;

    const loginData = await loginUserSchema.validateAsync(payload);

    const token = await loginUserService(loginData);

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    const statusCode = error.isJoi
      ? 400
      : error.message === "Invalid email or password"
      ? 401
      : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};
