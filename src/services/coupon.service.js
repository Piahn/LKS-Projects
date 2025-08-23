import { prisma } from "../utils/prisma.js";

export const createCouponService = async (payload) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.cupon.create({
    data: payload,
  });
};

export const getAllCouponService = async () => {
  return await prisma.cupon.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const getCouponByIdService = async (couponId) => {
  const coupon = await prisma.cupon.findUnique({
    where: {
      id: couponId,
    },
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
};

export const deleteCouponService = async (couponId) => {
  await getCouponByIdService(couponId);

  return await prisma.cupon.delete({
    where: {
      id: couponId,
    },
  });
};
