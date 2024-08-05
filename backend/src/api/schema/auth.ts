import { celebrate, Joi } from 'celebrate';
import JoiObjectId from "joi-objectid";
const objectId = JoiObjectId(Joi);

const AUTH_SCHEMA = {
    REGISTRATION: celebrate({
        body: Joi.object({
            firstName: Joi.string().required().messages({
                "string.empty": "firstName is not allowed to be empty",
                "string.base": "firstName must be a string",
                "any.required": "firstName is required"
            }),
            lastName: Joi.string().required().messages({
                "string.empty": "lastName is not allowed to be empty",
                "string.base": "lastName must be a string",
                "any.required": "lastName is required"
            }),
            email: Joi.string().email().required().lowercase().messages({
                "string.empty": "email is not allowed to be empty",
                "string.email": "Invalid email",
                "string.base": "email must be a string",
                "any.required": "email is required"
            }),
            password: Joi.string().required().messages({
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
            password: Joi.string().required().messages({
                "string.empty": "password is not allowed to be empty",
                "string.base": "password must be a string",
                "any.required": "password is required"
            }),
        })
    }),
};

export { AUTH_SCHEMA };