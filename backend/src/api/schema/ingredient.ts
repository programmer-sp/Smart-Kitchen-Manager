import { celebrate, Joi } from 'celebrate';

const INGREDIENT_SCHEMA = {
    CREATE: celebrate({
        body: Joi.object({
            name: Joi.string().required().messages({
                "string.empty": "category_name is not allowed to be empty",
                "string.base": "category_name must be a string",
                "any.required": "category_name is required"
            }),
            category_id: Joi.number().integer().required().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number",
                "any.required": "category_id is required"
            }),
        })
    }),
    READ: celebrate({
        query: Joi.object({
            ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number"
            }),
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
            ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number",
                "any.required": "ingredient_id is required"
            })
        }),
        body: Joi.object({
            name: Joi.string().optional().messages({
                "string.empty": "name is not allowed to be empty",
                "string.base": "name must be a string"
            }),
            category_id: Joi.number().integer().optional().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number"
            })
        })
    }),
    DELETE: celebrate({
        query: Joi.object({
            ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number",
                "any.required": "ingredient_id is required"
            })
        })
    }),
    CREATE_PRICE: celebrate({
        body: Joi.object({
            ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number",
                "any.required": "ingredient_id is required"
            }),
            store_id: Joi.number().integer().required().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number",
                "any.required": "store_id is required"
            }),
            price: Joi.number().integer().required().messages({
                "number.empty": "price is not allowed to be empty",
                "number.base": "price must be a number",
                "any.required": "price is required"
            }),
            unit: Joi.string().required().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string",
                "any.required": "unit is required"
            }),
            last_updated: Joi.string().required().messages({
                "string.empty": "last_updated is not allowed to be empty",
                "string.base": "last_updated must be a string",
                "any.required": "last_updated is required"
            }),
        })
    }),
    READ_PRICE: celebrate({
        query: Joi.object({
            ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number"
            }),
            price_id: Joi.number().integer().optional().messages({
                "number.empty": "price_id is not allowed to be empty",
                "number.base": "price_id must be a number"
            }),
            store_id: Joi.number().integer().optional().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number"
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
    UPDATE_PRICE: celebrate({
        params: Joi.object({
            price_id: Joi.number().integer().required().messages({
                "number.empty": "price_id is not allowed to be empty",
                "number.base": "price_id must be a number",
                "any.required": "price_id is required"
            })
        }),
        body: Joi.object({
            ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number"
            }),
            store_id: Joi.number().integer().optional().messages({
                "number.empty": "store_id is not allowed to be empty",
                "number.base": "store_id must be a number"
            }),
            price: Joi.number().integer().optional().messages({
                "number.empty": "price is not allowed to be empty",
                "number.base": "price must be a number"
            }),
            unit: Joi.string().optional().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string"
            }),
            last_updated: Joi.string().optional().messages({
                "string.empty": "last_updated is not allowed to be empty",
                "string.base": "last_updated must be a string"
            }),
        })
    }),
    DELETE_PRICE: celebrate({
        query: Joi.object({
            price_id: Joi.number().integer().required().messages({
                "number.empty": "price_id is not allowed to be empty",
                "number.base": "price_id must be a number",
                "any.required": "price_id is required"
            })
        })
    }),
};

export { INGREDIENT_SCHEMA };