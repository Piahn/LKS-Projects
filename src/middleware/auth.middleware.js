import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User Not Found",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verifikasi Token
    const secret = process.env.JWT_SECRET;
    const decode = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decode.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User Not Found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid Token",
      error: error.message,
    });
  }
};

export const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
};
