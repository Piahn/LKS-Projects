import { prisma } from "../utils/prisma.js";

export const getMyProfile = async (req, res) => {
  try {
    const userProfile = req.user;

    res.status(200).json({
      status: "success",
      message: "Profilee fetched successfully",
      data: userProfile,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
