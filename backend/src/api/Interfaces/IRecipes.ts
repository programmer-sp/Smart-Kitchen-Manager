import { Container } from 'typedi';
import * as l10n from 'jm-ez-l10n';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { MODULE_NAME, RESPONSE_METHOD } from '../../common/utils/Constants';
import {
    Recipes,
    Recipe_Ingredients,
    Ingredients,
    Ingredient_Categories,
    User_Ratings
} from '../../common/models/index';
import ingredientModel from '../../common/models/Ingredient_Details.model';
import recipeModel from '../../common/models/Recipe_Details.model';
import recipeRatingModel from '../../common/models/Recipe_Rating.model';
import { Op } from 'sequelize';

export class IRecipe {
    /* ---------------------- Recipe Detail API's ---------------------- */
    static async getRecipe(data: any, url: string) {
        try {
            if (data.recipe_id) {
                const recipeData = await recipeModel.findOne({ recipe_id: data.recipe_id });
                if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.READ }), data: recipeData };
            }

            if (data.ingredient_ids) {
                const ingdIds = data.ingredient_ids.replace(/,\s+/g, ',').split(',').filter(item => /^\d+$/.test(item)).map(Number);
                if (!ingdIds.length) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_REQUEST') };

                const recipeData = await recipeModel.find({
                    ingredients: {
                        "$elemMatch": { ingredient_id: { "$in": ingdIds } }
                    }
                });
                if (!recipeData.length) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.READ }), data: recipeData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;
            const condition: any = {
                attributes: ['recipe_id', 'recipe_name', 'cuisine', 'system_rating', 'is_rated'],
                offset: (page - 1) * limit,
                limit: limit,
                order: data.rating_filter ? [['system_rating', data.rating_filter]] : [['createdAt', 'DESC']],
            };

            if (search) condition['where'] = {
                [Op.or]: [
                    { recipe_name: { [Op.iLike]: `%${search}%` } },
                    { cuisine: { [Op.iLike]: `%${search}%` } }
                ]
            };
            const recipeData = await Recipes.findAndCountAll(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE, method: RESPONSE_METHOD.READ }), count: recipeData.count, data: recipeData.rows };

        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getRecipe" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Recipe Ingredient API's ---------------------- */
    static async getRecipeIngd(data: any, url: string) {
        try {
            if (data.recipe_ingredient_id) {
                const recipeIngdData = await Recipe_Ingredients.findOne({ where: { recipe_ingredient_id: data.recipe_ingredient_id } });
                if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

                const ingdData = await ingredientModel.findOne({ ingredient_id: recipeIngdData.ingredient_id });
                if (!ingdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), data: ingdData };
            } else if (data.recipe_id) {
                const recipeIngdData = await Recipes.findOne({
                    where: { recipe_id: data.recipe_id },
                    attributes: ['recipe_name', 'cuisine', 'preparation_time', 'system_rating', 'expiration_date'],
                    include: [
                        {
                            model: Recipe_Ingredients,
                            attributes: ['recipe_id', 'ingredient_id', 'quantity', 'unit'],
                            include: [
                                {
                                    model: Ingredients,
                                    attributes: ['name', 'category_id'],
                                    include: [
                                        {
                                            model: Ingredient_Categories,
                                            attributes: ['category_name']
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                });
                if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), data: recipeIngdData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const condition: any = {
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            };

            const recipeIngdData = await Recipe_Ingredients.findAndCountAll(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count: recipeIngdData.count, data: recipeIngdData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getRecipeIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Recipe Rating API's ---------------------- */
    static async addRecipeRating(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');

            const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
            if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

            const ratingData = await User_Ratings.create({
                user_id: tokenData.user_id,
                recipe_id: data.recipe_id,
                rating: data.rating,
                review: data.review
            });

            await recipeRatingModel.create({
                rating_id: ratingData.rating_id,
                user_id: tokenData.user_id,
                recipe_id: data.recipe_id,
                rating: data.rating,
                review: data.review
            });

            if (recipeData.is_rated != true) {
                await Recipes.update({ is_rated: true }, { where: { recipe_id: data.recipe_id } });
                await recipeModel.updateOne({ recipe_id: data.recipe_id }, { is_rated: true });
            }

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_RATING, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addRecipeRating" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}