import { celebrate, Joi } from 'celebrate';

const USER_SCHEMA = {
    UPDATE: celebrate({
        body: Joi.object({
            dietary_restrictions: Joi.string().required().messages({
                "string.empty": "dietary_restrictions is not allowed to be empty",
                "string.base": "dietary_restrictions must be a string",
                "any.required": "dietary_restrictions is required"
            }),
            preferred_cuisines: Joi.string().required().messages({
                "string.empty": "preferred_cuisines is not allowed to be empty",
                "string.base": "preferred_cuisines must be a string",
                "any.required": "preferred_cuisines is required"
            }),
        })
    }),
};

export { USER_SCHEMA };