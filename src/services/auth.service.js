import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";
import jwt from "jsonwebtoken";

export const registerUserService = async (payload) => {
  try {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("Email already exists");
    }
    throw error;
  }
};

export const loginUserService = async (payload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new Error("Invalid users credencial");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid Password");
  }

  const userData = {
    id: user.id,
    username: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  return token;
};
