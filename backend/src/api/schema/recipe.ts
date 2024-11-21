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
            }),
            ingredient_ids: Joi.string().optional().messages({
                "string.empty": "ingredient_ids is not allowed to be empty",
                "string.base": "ingredient_ids must be a string",
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
    ADD_RECIPE_RATING: celebrate({
        body: Joi.object({
            recipe_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "recipe_id is required"
            }),
            rating: Joi.number().integer().min(1).max(5).required().messages({
                "number.empty": "rating is not allowed to be empty",
                "number.base": "rating must be a number",
                "number.max": "rating should not be more than 5",
                "number.min": "rating should not be less than 1",
                "any.required": "rating is required"
            }),
            review: Joi.string().required().messages({
                "string.empty": "review is not allowed to be empty",
                "string.base": "review must be a string",
                "any.required": "recipe_id is required"
            }),
        })
    }),
};

export { RECIPE_SCHEMA };