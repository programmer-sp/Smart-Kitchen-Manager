import { celebrate, Joi } from 'celebrate';

const RECIPE_SCHEMA = {
    CREATE: celebrate({
        body: Joi.object({
            recipe_name: Joi.string().required().messages({
                "string.empty": "recipe_name is not allowed to be empty",
                "string.base": "recipe_name must be a string",
                "any.required": "recipe_name is required"
            }),
            cuisine: Joi.string().required().messages({
                "string.empty": "cuisine is not allowed to be empty",
                "string.base": "cuisine must be a string",
                "any.required": "cuisine is required"
            }),
            preparation_time: Joi.number().integer().required().messages({
                "number.empty": "preparation_time is not allowed to be empty",
                "number.base": "preparation_time must be a number",
                "any.required": "preparation_time is required"
            }),
            expiration_date: Joi.string().required().messages({
                "string.empty": "expiration_date is not allowed to be empty",
                "string.base": "expiration_date must be a string",
                "any.required": "expiration_date is required"
            }),
        })
    }),
    READ: celebrate({
        query: Joi.object({
            recipe_id: Joi.number().integer().optional().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number"
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
    UPDATE: celebrate({
        params: Joi.object({
            recipe_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "recipe_id is required"
            })
        }),
        body: Joi.object({
            recipe_name: Joi.string().optional().messages({
                "string.empty": "recipe_name is not allowed to be empty",
                "string.base": "recipe_name must be a string"
            }),
            cuisine: Joi.string().optional().messages({
                "string.empty": "cuisine is not allowed to be empty",
                "string.base": "cuisine must be a string"
            }),
            preparation_time: Joi.number().integer().optional().messages({
                "number.empty": "preparation_time is not allowed to be empty",
                "number.base": "preparation_time must be a number"
            }),
            expiration_date: Joi.string().optional().messages({
                "string.empty": "expiration_date is not allowed to be empty",
                "string.base": "expiration_date must be a string"
            }),
            system_rating: Joi.number().integer().optional().messages({
                "number.empty": "system_rating is not allowed to be empty",
                "number.base": "system_rating must be a number"
            }),
        })
    }),
    DELETE: celebrate({
        query: Joi.object({
            recipe_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "recipe_id is required"
            })
        })
    }),
};

export { RECIPE_SCHEMA };