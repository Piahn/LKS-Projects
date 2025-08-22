import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().max(200).required(),
  price: Joi.number().integer().positive().required(),
  categoryId: Joi.string().required(),
  ImageUrl: Joi.string().uri().optional().allow(null, ""),
});
