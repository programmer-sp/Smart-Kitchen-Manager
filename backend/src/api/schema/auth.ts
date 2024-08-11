import { celebrate, Joi } from 'celebrate';

const AUTH_SCHEMA = {
    REGISTRATION: celebrate({
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
            password_hash: Joi.string().required().messages({
                "string.empty": "password is not allowed to be empty",
                "string.base": "password must be a string",
                "any.required": "password is required"
            }),
        })
    }),
    LOGIN: celebrate({
        body: Joi.object({
            email: Joi.string().email().required().lowercase().messages({
                "string.empty": "email is not allowed to be empty",
                "string.email": "Invalid email",
                "string.base": "email must be a string",
                "any.required": "email is required"
            }),
            password_hash: Joi.string().required().messages({
                "string.empty": "password is not allowed to be empty",
                "string.base": "password must be a string",
                "any.required": "password is required"
            }),
        })
    }),
};

export { AUTH_SCHEMA };