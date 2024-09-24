import ms from 'ms';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from '../../common/utils/Constants';
import { Ingredient_Categories } from '../../common/models/index';
import { redis } from '../../common/services/redis';
import { Op } from 'sequelize';

export class ICategory {
    static async addCategory(data: any, url: string) {
        try {
            const isExsits = await Ingredient_Categories.findOne({ where: { category_name: { [Op.iLike]: `%${data.category_name}%` } } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.CATEGORY }) };

            await Ingredient_Categories.create({ category_name: data.category_name });
            await redis.deleteKey({ key: REDIS_KEYS.CATEGORY_LIST });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getCategory(data: any, url: string) {
        try {
            if (data.category_id) {
                const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
                if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.READ }), data: categoryData };
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const search = data.search;
                const condition: any = {
                    offset: (page - 1) * limit,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                };

                let categoryData: any = [];
                if (page != 1 || limit != 10 || search) {
                    if (search) condition['where'] = { category_name: { [Op.iLike]: `%${search}%` } };

                    categoryData = await Ingredient_Categories.findAndCountAll(condition);
                } else {
                    const isExists: any = await redis.getValue({ key: REDIS_KEYS.CATEGORY_LIST });
                    if (!isExists) {
                        categoryData = await Ingredient_Categories.findAndCountAll(condition);

                        await redis.setValue({ key: REDIS_KEYS.CATEGORY_LIST, value: { data: categoryData.rows, count: categoryData.count }, duration: ms(config.REDIS_TTL) });
                    } else {
                        categoryData['rows'] = isExists.data;
                        categoryData['count'] = isExists.count;
                    }
                }

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.READ }), count: categoryData.count, data: categoryData.rows };
            }
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateCategory(data: any, url: string) {
        try {
            const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
            if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

            await Ingredient_Categories.update({ category_name: data.category_name }, { where: { category_id: data.category_id } });
            await redis.deleteKey({ key: REDIS_KEYS.CATEGORY_LIST });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteCategory(data: any, url: string) {
        try {
            const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
            if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

            await Ingredient_Categories.destroy({ where: { category_id: data.category_id } });
            await redis.deleteKey({ key: REDIS_KEYS.CATEGORY_LIST });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}