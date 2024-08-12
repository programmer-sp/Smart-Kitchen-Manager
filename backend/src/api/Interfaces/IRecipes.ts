import * as l10n from 'jm-ez-l10n';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { MODULE_NAME, RESPONSE_METHOD } from '../../common/utils/Constants';
import { Recipes } from '../../common/models/index';
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
}