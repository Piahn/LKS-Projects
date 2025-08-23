import Joi from "joi";

const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().required(),
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).required(),
  couponCode: Joi.string().optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "waiting_payment",
      "paid",
      "processing",
      "shipped",
      "completed",
      "cancelled"
    )
    .required(),
});
