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
            household_id: Joi.number().integer().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number"
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
    ADD_USER: celebrate({
        body: Joi.object({
            email: Joi.string().email().required().lowercase().messages({
                "string.empty": "email is not allowed to be empty",
                "string.email": "Invalid email",
                "string.base": "email must be a string",
                "any.required": "email is required"
            }),
            role: Joi.string().required().valid('guest', 'member', 'owner', 'moderator', 'administrator', 'content creator', 'viewer').lowercase().messages({
                "string.empty": "role is not allowed to be empty",
                "string.base": "role must be a string",
                "any.required": "role is required"
            }),
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
            }),
        })
    }),
    READ_USER: celebrate({
        query: Joi.object({
            household_id: Joi.number().integer().optional().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number"
            }),
            household_user_id: Joi.number().integer().optional().messages({
                "number.empty": "household_user_id is not allowed to be empty",
                "number.base": "household_user_id must be a number"
            }),
        })
    }),
    UPDATE_USER: celebrate({
        params: Joi.object({
            household_user_id: Joi.number().integer().required().messages({
                "number.empty": "household_user_id is not allowed to be empty",
                "number.base": "household_user_id must be a number",
                "any.required": "household_user_id is required"
            }),
        }),
        body: Joi.object({
            role: Joi.string().required().valid('guest', 'member', 'owner', 'moderator', 'administrator', 'content creator', 'viewer').lowercase().messages({
                "string.empty": "role is not allowed to be empty",
                "string.base": "role must be a string",
                "any.required": "role is required"
            }),
        })
    }),
    DELETE_USER: celebrate({
        query: Joi.object({
            household_user_id: Joi.number().integer().required().messages({
                "number.empty": "household_user_id is not allowed to be empty",
                "number.base": "household_user_id must be a number",
                "any.required": "household_user_id is required"
            }),
        })
    }),
    ADD_INGREDIENT: celebrate({
        body: Joi.object({
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
            }),
            ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number",
                "any.required": "ingredient_id is required"
            }),
            quantity: Joi.string().required().messages({
                "string.empty": "quantity is not allowed to be empty",
                "string.base": "quantity must be a string",
                "any.required": "quantity is required"
            }),
            unit: Joi.string().optional().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string"
            }),
            expiration_date: Joi.string().optional().messages({
                "string.empty": "expiration_date is not allowed to be empty",
                "string.base": "expiration_date must be a string"
            }),
        })
    }),
    READ_INGREDIENT: celebrate({
        query: Joi.object({
            household_id: Joi.number().integer().optional().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number"
            }),
            household_ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "household_ingredient_id is not allowed to be empty",
                "number.base": "household_ingredient_id must be a number"
            }),
        })
    }),
    UPDATE_INGREDIENT: celebrate({
        params: Joi.object({
            household_ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "household_ingredient_id is not allowed to be empty",
                "number.base": "household_ingredient_id must be a number",
                "any.required": "household_ingredient_id is required"
            }),
        }),
        body: Joi.object({
            quantity: Joi.string().optional().messages({
                "string.empty": "quantity is not allowed to be empty",
                "string.base": "quantity must be a string"
            }),
            unit: Joi.string().optional().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string"
            }),
            expiration_date: Joi.string().optional().messages({
                "string.empty": "expiration_date is not allowed to be empty",
                "string.base": "expiration_date must be a string"
            }),
            is_expired: Joi.boolean().optional().messages({
                "boolean.empty": "is_expired is not allowed to be empty",
                "boolean.base": "is_expired must be a boolean"
            }),
        })
    }),
    DELETE_INGREDIENT: celebrate({
        query: Joi.object({
            household_ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "household_ingredient_id is not allowed to be empty",
                "number.base": "household_ingredient_id must be a number",
                "any.required": "household_ingredient_id is required"
            }),
        })
    }),
};

export { HOUSEHOLD_SCHEMA };