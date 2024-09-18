import * as l10n from 'jm-ez-l10n';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { MODULE_NAME, RESPONSE_METHOD } from '../../common/utils/Constants';
import { Recipes, Recipe_Ingredients, Ingredients } from '../../common/models/index';
import { Op } from 'sequelize';

export class IRecipe {
    static async addRecipe(data: any, url: string) {
        try {
            await Recipes.create({
                recipe_name: data.recipe_name,
                cuisine: data.cuisine,
                preparation_time: data.preparation_time,
                expiration_date: data.expiration_date
            });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addRecipe" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getRecipe(data: any, url: string) {
        try {
            if (data.recipe_id) {
                const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
                if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.READ }), data: recipeData };
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const search = data.search;
                const condition: any = {
                    offset: (page - 1) * limit,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                };

                if (search) condition['where'] = {
                    recipe_name: { [Op.iLike]: `%${search}%` },
                    cuisine: { [Op.iLike]: `%${search}%` }
                };
                const recipeData = await Recipes.findAndCountAll(condition);

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.READ }), count: recipeData.count, data: recipeData.rows };
            }
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getRecipe" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateRecipe(data: any, url: string) {
        try {
            const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
            if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

            let updateDataObj = {};
            if (data.recipe_name) updateDataObj['recipe_name'] = data.recipe_name;
            if (data.cuisine) updateDataObj['cuisine'] = data.cuisine;
            if (data.preparation_time) updateDataObj['preparation_time'] = data.preparation_time;
            if (data.system_rating) {
                updateDataObj['system_rating'] = data.system_rating;
                updateDataObj['is_rated'] = true;
            }
            if (data.expiration_date) updateDataObj['expiration_date'] = data.expiration_date;

            await Recipes.update(updateDataObj, { where: { recipe_id: data.recipe_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateRecipe" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteRecipe(data: any, url: string) {
        try {
            const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
            if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

            await Recipes.destroy({ where: { recipe_id: data.recipe_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteRecipe" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }



    static async addRecipeIngd(data: any, url: string) {
        try {
            const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
            if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

            const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            await Recipe_Ingredients.create({
                recipe_id: data.recipe_id,
                ingredient_id: data.ingredient_id,
                quantity: data.quantity,
                unit: data.unit,
            });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addRecipeIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getRecipeIngd(data: any, url: string) {
        try {
            if (data.recipe_ingredient_id) {
                const recipeIngdData = await Recipe_Ingredients.findOne({ where: { recipe_ingredient_id: data.recipe_ingredient_id } });
                if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), data: recipeIngdData };
            } else if (data.recipe_id) {
                const recipeIngdData = await Recipe_Ingredients.findOne({ where: { recipe_id: data.recipe_id } });
                if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), data: recipeIngdData };
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const condition: any = {
                    offset: (page - 1) * limit,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                };

                const recipeIngdData = await Recipe_Ingredients.findAndCountAll(condition);

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count: recipeIngdData.count, data: recipeIngdData.rows };
            }
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getRecipeIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateRecipeIngd(data: any, url: string) {
        try {
            const recipeIngdData = await Recipe_Ingredients.findOne({ where: { recipe_ingredient_id: data.recipe_ingredient_id } });
            if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

            if (recipeIngdData.recipe_id != data.recipe_id) {
                const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
                if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };
            }

            if (recipeIngdData.ingredient_id != data.ingredient_id) {
                const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
                if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };
            }

            let updateDataObj = {};
            if (data.recipe_id) updateDataObj['recipe_id'] = data.recipe_id;
            if (data.ingredient_id) updateDataObj['ingredient_id'] = data.ingredient_id;
            if (data.quantity) updateDataObj['quantity'] = data.quantity;
            if (data.unit) updateDataObj['unit'] = data.unit;

            await Recipe_Ingredients.update(updateDataObj, { where: { recipe_ingredient_id: data.recipe_ingredient_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateRecipeIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteRecipeIngd(data: any, url: string) {
        try {
            const recipeIngdData = await Recipe_Ingredients.findOne({ where: { recipe_ingredient_id: data.recipe_ingredient_id } });
            if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

            await Recipe_Ingredients.destroy({ where: { recipe_ingredient_id: data.recipe_ingredient_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteRecipeIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}