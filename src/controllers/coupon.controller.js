import * as couponService from "../services/coupon.service.js";
import { createCouponSchema } from "../validators/coupon.validator.js";

export const createCoupon = async (req, res) => {
  try {
    const payload = req.body;

    const couponData = await createCouponSchema.validateAsync(payload);

    const newCoupon = await couponService.createCouponService(couponData);

    res.status(201).json({
      status: "success",
      data: newCoupon,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAllCouponService();

    res.status(200).json({
      status: "success",
      message: "Coupon fetched successfully",
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await couponService.deleteCouponService(id);

    res.status(200).json({
      status: "success",
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
        status: 'error',
        message: error.message
    })
  }
};
