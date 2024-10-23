import { celebrate, Joi } from 'celebrate';

const ADMIN_SCHEMA = {
    READ_USER: celebrate({
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
    PATCH_USER: celebrate({
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
    CREATE_STORE: celebrate({
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
    READ_STORE: celebrate({
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
    UPDATE_STORE: celebrate({
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
    DELETE_STORE: celebrate({
        query: Joi.object({
            store_id: Joi.number().integer().required().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number",
                "any.required": "store_id is required"
            })
        })
    }),
};

export { ADMIN_SCHEMA };