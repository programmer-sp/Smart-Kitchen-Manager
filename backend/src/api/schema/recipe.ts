import { celebrate, Joi } from 'celebrate';

const RECIPE_SCHEMA = {
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
            }),
            rating_filter: Joi.string().optional().valid('asc', 'desc', 'ASC', 'DESC').uppercase().messages({
                "string.empty": "rating_filter is not allowed to be empty",
                "string.base": "rating_filter must be a string",
                "any.only": "rating_filter should be asc or desc",
                "any.required": "rating_filter is required"
            }),
        })
    }),
    READ_INGREDIENT: celebrate({
        query: Joi.object({
            recipe_ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "recipe_ingredient_id is not allowed to be empty",
                "number.base": "recipe_ingredient_id must be a number"
            }),
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
};

export { RECIPE_SCHEMA };