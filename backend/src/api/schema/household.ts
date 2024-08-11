import { celebrate, Joi } from 'celebrate';

const HOUSEHOLD_SCHEMA = {
    CREATE: celebrate({
        body: Joi.object({
            household_name: Joi.string().required().messages({
                "string.empty": "household_name is not allowed to be empty",
                "string.base": "household_name must be a string",
                "any.required": "household_name is required"
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
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
            }),
        })
    }),
    UPDATE: celebrate({
        params: Joi.object({
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
            }),
        }),
        body: Joi.object({
            household_name: Joi.string().optional().messages({
                "string.empty": "household_name is not allowed to be empty",
                "string.base": "household_name must be a string"
            }),
            address: Joi.string().optional().messages({
                "string.empty": "address is not allowed to be empty",
                "string.base": "address must be a string"
            }),
        })
    }),
    DELETE: celebrate({
        query: Joi.object({
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
            }),
        })
    }),
    PATCH: celebrate({
        params: Joi.object({
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
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

export { HOUSEHOLD_SCHEMA };