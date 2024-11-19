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
    ADD_STORE: celebrate({
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
    ADD_HOUSEHOLD: celebrate({
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
    READ_HOUSEHOLD: celebrate({
        query: Joi.object({
            household_id: Joi.number().integer().optional().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number"
            }),
            search: Joi.string().optional().messages({
                "string.empty": "Search not allowed to be empty"
            }),
            page: Joi.number().integer().min(1).when('household_id', {
                is: Joi.exist(),
                then: Joi.optional(),
                otherwise: Joi.required()
            }).messages({
                "number.base": "Page must be a number",
                "number.min": "Page must be greater than or equal to 1"
            }),
            limit: Joi.number().integer().when('household_id', {
                is: Joi.exist(),
                then: Joi.optional(),
                otherwise: Joi.required()
            }).messages({
                "number.base": "Limit must be a number"
            })
        })
    }),
    UPDATE_HOUSEHOLD: celebrate({
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
    DELETE_HOUSEHOLD: celebrate({
        query: Joi.object({
            household_id: Joi.number().integer().required().messages({
                "number.empty": "household_id is not allowed to be empty",
                "number.base": "household_id must be a number",
                "any.required": "household_id is required"
            }),
        })
    }),
    PATCH_HOUSEHOLD: celebrate({
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
    ADD_HOUSEHOLD_USER: celebrate({
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
    READ_HOUSEHOLD_USER: celebrate({
        query: Joi.object({
            household_user_id: Joi.number().integer().optional().messages({
                "number.empty": "household_user_id is not allowed to be empty",
                "number.base": "household_user_id must be a number"
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
    UPDATE_HOUSEHOLD_USER: celebrate({
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
    DELETE_HOUSEHOLD_USER: celebrate({
        query: Joi.object({
            household_user_id: Joi.number().integer().required().messages({
                "number.empty": "household_user_id is not allowed to be empty",
                "number.base": "household_user_id must be a number",
                "any.required": "household_user_id is required"
            }),
        })
    }),
    PATCH_HOUSEHOLD_USER: celebrate({
        params: Joi.object({
            household_user_id: Joi.number().integer().required().messages({
                "number.empty": "household_user_id is not allowed to be empty",
                "number.base": "household_user_id must be a number",
                "any.required": "household_user_id is required"
            }),
        }),
        body: Joi.object({
            active: Joi.boolean().optional().messages({
                "boolean.empty": "active is not allowed to be empty",
                "boolean.base": "active must be a boolean"
            }),
        })
    }),
    ADD_INGD_CATEGORY: celebrate({
        body: Joi.object({
            category_name: Joi.string().required().messages({
                "string.empty": "category_name is not allowed to be empty",
                "string.base": "category_name must be a string",
                "any.required": "category_name is required"
            }),
        })
    }),
    READ_INGD_CATEGORY: celebrate({
        query: Joi.object({
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
    UPDATE_INGD_CATEGORY: celebrate({
        params: Joi.object({
            category_id: Joi.number().integer().required().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number",
                "any.required": "category_id is required"
            })
        }),
        body: Joi.object({
            category_name: Joi.string().optional().messages({
                "string.empty": "category_name is not allowed to be empty",
                "string.base": "category_name must be a string"
            }),
        })
    }),
    DELETE_INGD_CATEGORY: celebrate({
        query: Joi.object({
            category_id: Joi.number().integer().required().messages({
                "number.empty": "category_id is not allowed to be empty",
                "number.base": "category_id must be a number",
                "any.required": "category_id is required"
            })
        })
    }),
    ADD_INGD_PRICE: celebrate({
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
    READ_INGD_PRICE: celebrate({
        query: Joi.object({
            ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number"
            }),
            price_id: Joi.number().integer().optional().messages({
                "number.empty": "price_id is not allowed to be empty",
                "number.base": "price_id must be a number"
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
    UPDATE_INGD_PRICE: celebrate({
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
    DELETE_INGD_PRICE: celebrate({
        query: Joi.object({
            price_id: Joi.number().integer().required().messages({
                "number.empty": "price_id is not allowed to be empty",
                "number.base": "price_id must be a number",
                "any.required": "price_id is required"
            })
        })
    }),
    ADD_INGD: celebrate({
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
            unit: Joi.string().required().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string",
                "any.required": "unit is required"
            }),
            value: Joi.string().required().messages({
                "string.empty": "value is not allowed to be empty",
                "string.base": "value must be a string",
                "any.required": "value is required"
            }),
            nutritional_info: Joi.string().required().messages({
                "string.empty": "nutritional_info is not allowed to be empty",
                "string.base": "nutritional_info must be a string",
                "any.required": "nutritional_info is required"
            }),
        }).options({ allowUnknown: true })
    }),
    READ_INGD: celebrate({
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
    UPDATE_INGD: celebrate({
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
            }),
            unit: Joi.string().optional().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string"
            }),
            value: Joi.string().optional().messages({
                "string.empty": "value is not allowed to be empty",
                "string.base": "value must be a string"
            }),
            nutritional_info: Joi.string().optional().messages({
                "string.empty": "nutritional_info is not allowed to be empty",
                "string.base": "nutritional_info must be a string"
            }),
        }).options({ allowUnknown: true })
    }),
    DELETE_INGD: celebrate({
        query: Joi.object({
            ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number",
                "any.required": "ingredient_id is required"
            })
        })
    }),
    ADD_RECIPE: celebrate({
        body: Joi.object({
            recipe_name: Joi.string().required().messages({
                "string.empty": "recipe_name is not allowed to be empty",
                "string.base": "recipe_name must be a string",
                "any.required": "recipe_name is required"
            }),
            cuisine: Joi.string().required().messages({
                "string.empty": "cuisine is not allowed to be empty",
                "string.base": "cuisine must be a string",
                "any.required": "cuisine is required"
            }),
            preparation_time: Joi.number().integer().required().messages({
                "number.empty": "preparation_time is not allowed to be empty",
                "number.base": "preparation_time must be a number",
                "any.required": "preparation_time is required"
            }),
            expiration_date: Joi.string().required().messages({
                "string.empty": "expiration_date is not allowed to be empty",
                "string.base": "expiration_date must be a string",
                "any.required": "expiration_date is required"
            }),
        })
    }),
    READ_RECIPE: celebrate({
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
            })
        })
    }),
    UPDATE_RECIPE: celebrate({
        params: Joi.object({
            recipe_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "recipe_id is required"
            })
        }),
        body: Joi.object({
            recipe_name: Joi.string().optional().messages({
                "string.empty": "recipe_name is not allowed to be empty",
                "string.base": "recipe_name must be a string"
            }),
            cuisine: Joi.string().optional().messages({
                "string.empty": "cuisine is not allowed to be empty",
                "string.base": "cuisine must be a string"
            }),
            preparation_time: Joi.number().integer().optional().messages({
                "number.empty": "preparation_time is not allowed to be empty",
                "number.base": "preparation_time must be a number"
            }),
            expiration_date: Joi.string().optional().messages({
                "string.empty": "expiration_date is not allowed to be empty",
                "string.base": "expiration_date must be a string"
            }),
            system_rating: Joi.number().integer().optional().messages({
                "number.empty": "system_rating is not allowed to be empty",
                "number.base": "system_rating must be a number"
            }),
        })
    }),
    DELETE_RECIPE: celebrate({
        query: Joi.object({
            recipe_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "recipe_id is required"
            })
        })
    }),
    ADD_RECIPE_INGREDIENT: celebrate({
        body: Joi.object({
            recipe_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "recipe_id is required"
            }),
            ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number",
                "any.required": "ingredient_id is required"
            }),
            quantity: Joi.number().integer().required().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number",
                "any.required": "quantity is required"
            }),
            unit: Joi.string().required().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string",
                "any.required": "unit is required"
            }),
        })
    }),
    READ_RECIPE_INGREDIENT: celebrate({
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
    UPDATE_RECIPE_INGREDIENT: celebrate({
        params: Joi.object({
            recipe_ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_ingredient_id is not allowed to be empty",
                "number.base": "recipe_ingredient_id must be a number",
                "any.required": "recipe_ingredient_id is required"
            })
        }),
        body: Joi.object({
            recipe_id: Joi.number().integer().optional().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number"
            }),
            ingredient_id: Joi.number().integer().optional().messages({
                "number.empty": "ingredient_id is not allowed to be empty",
                "number.base": "ingredient_id must be a number"
            }),
            quantity: Joi.number().integer().optional().messages({
                "number.empty": "recipe_id is not allowed to be empty",
                "number.base": "recipe_id must be a number"
            }),
            unit: Joi.string().messages({
                "string.empty": "unit is not allowed to be empty",
                "string.base": "unit must be a string"
            }),
        })
    }),
    DELETE_RECIPE_INGREDIENT: celebrate({
        query: Joi.object({
            recipe_ingredient_id: Joi.number().integer().required().messages({
                "number.empty": "recipe_ingredient_id is not allowed to be empty",
                "number.base": "recipe_ingredient_id must be a number",
                "any.required": "recipe_ingredient_id is required"
            })
        })
    }),
};

export { ADMIN_SCHEMA };