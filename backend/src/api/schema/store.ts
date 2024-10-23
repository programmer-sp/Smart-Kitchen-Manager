import { celebrate, Joi } from 'celebrate';

const STORE_SCHEMA = {
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
};

export { STORE_SCHEMA };