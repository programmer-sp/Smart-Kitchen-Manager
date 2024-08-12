import { celebrate, Joi } from 'celebrate';

const CATEGORY_SCHEMA = {
    CREATE: celebrate({
        body: Joi.object({
            category_name: Joi.string().required().messages({
                "string.empty": "category_name is not allowed to be empty",
                "string.base": "category_name must be a string",
                "any.required": "category_name is required"
            }),
        })
    }),
    READ: celebrate({
        query: Joi.object({
            category_id: Joi.number().integer().optional().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number"
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
            category_id: Joi.number().integer().required().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number",
                "any.required": "category_id is required"
            })
        }),
        body: Joi.object({
            category_name: Joi.string().optional().messages({
                "string.empty": "category_name is not allowed to be empty",
                "string.base": "category_name must be a string"
            }),
        })
    }),
    DELETE: celebrate({
        query: Joi.object({
            category_id: Joi.number().integer().required().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number",
                "any.required": "category_id is required"
            })
        })
    }),
};

export { CATEGORY_SCHEMA };