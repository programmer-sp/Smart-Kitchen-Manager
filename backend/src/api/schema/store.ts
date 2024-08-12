import { celebrate, Joi } from 'celebrate';

const STORE_SCHEMA = {
    CREATE: celebrate({
        body: Joi.object({
            store_name: Joi.string().required().messages({
                "string.empty": "store_name is not allowed to be empty",
                "string.base": "store_name must be a string",
                "any.required": "store_name is required"
            }),
            address: Joi.string().required().messages({
                "string.empty": "address is not allowed to be empty",
                "string.base": "address must be a string",
                "any.required": "address is required"
            }),
        })
    }),
    READ: celebrate({
        query: Joi.object({
            store_id: Joi.number().integer().optional().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number",
                "any.required": "store_id is required"
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
            store_id: Joi.number().integer().required().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number",
                "any.required": "store_id is required"
            })
        }),
        body: Joi.object({
            store_name: Joi.string().optional().messages({
                "string.empty": "store_name is not allowed to be empty",
                "string.base": "store_name must be a string"
            }),
            address: Joi.string().optional().messages({
                "string.empty": "address is not allowed to be empty",
                "string.base": "address must be a string"
            }),
        })
    }),
    DELETE: celebrate({
        query: Joi.object({
            store_id: Joi.number().integer().required().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number",
                "any.required": "store_id is required"
            })
        })
    }),
};

export { STORE_SCHEMA };