import Joi from "joi";

export const categorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(200).required(),
});
