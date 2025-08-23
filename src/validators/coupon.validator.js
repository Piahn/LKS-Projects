import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().required(),
  jenis_diskon: Joi.string().valid("persentase", "nominal").required(),
  nilai_diskon: Joi.number().required(),
  expiration: Joi.string().required(),
  is_active: Joi.boolean().required(),
  userId: Joi.string(),
});
