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
    READ: celebrate({
        query: Joi.object({
            user_id: Joi.number().integer().optional().messages({
                "number.empty": "user_id is not allowed to be empty",
                "number.base": "user_id must be a number"
            }),
            search: Joi.string().optional().messages({
                "string.empty": "Search not allowed to be empty"
            }),
            page: Joi.number().integer().min(1).optional().messages({
                "number.base": "Page must be a number",
                "number.min": "Page must be greater than or equal to 1"
            }),
            limit: Joi.number().integer().optional().messages({
                "number.base": "Limit must be a number"
            })
        })
    }),
    PATCH: celebrate({
        params: Joi.object({
            user_id: Joi.number().integer().required().messages({
                "number.empty": "user_id is not allowed to be empty",
                "number.base": "user_id must be a number",
                "any.required": "user_id is required"
            }),
        }),
        body: Joi.object({
            active: Joi.boolean().optional().messages({
                "boolean.empty": "active is not allowed to be empty",
                "boolean.base": "active must be a boolean"
            }),
        })
    }),
};

export { USER_SCHEMA };