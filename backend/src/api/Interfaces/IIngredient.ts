import ms from 'ms';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from '../../common/utils/Constants';
import { Ingredients, Ingredient_Categories, Ingredient_Prices, Stores } from '../../common/models/index';
import { redis } from '../../common/services/redis';
import { Op } from 'sequelize';

export class IIngredient {
    static async addIngredient(data: any, url: string) {
        try {
            const isExsits = await Ingredients.findOne({ where: { name: { [Op.iLike]: `%${data.name}%` } } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.INGREDIENT }) };

            const isCategoryExsits = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
            if (!isCategoryExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

            await Ingredients.create({ name: data.name, category_id: data.category_id });
            await redis.deleteKey({ key: REDIS_KEYS.INGREDIENT_LIST });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getIngredient(data: any, url: string) {
        try {
            if (data.ingredient_id) {
                const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
                if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count: 1, data: ingredientData };
            } else if (data.category_id) {
                const ingredientData = await Ingredients.findAndCountAll({ where: { category_id: data.category_id } });

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count: ingredientData.count, data: ingredientData.rows };
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const search = data.search;
                const condition: any = {
                    offset: (page - 1) * limit,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                };

                let ingredientData: any = [];
                if (page != 1 || limit != 10 || search) {
                    if (search) condition['where'] = { name: { [Op.iLike]: `%${search}%` } };

                    ingredientData = await Ingredients.findAndCountAll(condition);
                } else {
                    const isExists: any = await redis.getValue({ key: REDIS_KEYS.INGREDIENT_LIST });
                    if (!isExists) {
                        ingredientData = await Ingredients.findAndCountAll(condition);

                        await redis.setValue({ key: REDIS_KEYS.INGREDIENT_LIST, value: { data: ingredientData.rows, count: ingredientData.count }, duration: ms(config.REDIS_TTL) });
                    } else {
                        ingredientData['rows'] = isExists.data;
                        ingredientData['count'] = isExists.count;
                    }
                }

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count: ingredientData.count, data: ingredientData.rows };
            }
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateIngredient(data: any, url: string) {
        try {
            const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            let updateData = { name: data.name };
            if (data.category_id != ingredientData.category_id) {
                const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
                if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

                updateData['category_id'] = data.category_id;
            }
            await Ingredients.update(updateData, { where: { ingredient_id: data.ingredient_id } });
            await redis.deleteKey({ key: REDIS_KEYS.INGREDIENT_LIST });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteIngredient(data: any, url: string) {
        try {
            const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            await Ingredients.destroy({ where: { ingredient_id: data.ingredient_id } });
            await redis.deleteKey({ key: REDIS_KEYS.INGREDIENT_LIST });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }



    static async addIngredientPrice(data: any, url: string) {
        try {
            const isExsits = await Ingredient_Prices.findOne({ where: { ingredient_id: data.ingredient_id, store_id: data.store_id } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE }) };

            const isIngredientExsits = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!isIngredientExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            const isStoreExsits = await Stores.findOne({ where: { store_id: data.store_id } });
            if (!isStoreExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

            await Ingredient_Prices.create({ ingredient_id: data.ingredient_id, store_id: data.store_id, price: data.price, unit: data.unit, last_updated: data.last_updated });
            await redis.deleteKey({ key: REDIS_KEYS.INGREDIENT_PRICE_LIST });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getIngredientPrice(data: any, url: string) {
        try {
            let ingredientPriceData: any = {};
            if (data.price_id) {
                ingredientPriceData = await Ingredient_Prices.findAndCountAll({
                    where: { price_id: data.price_id },
                    include: [
                        {
                            model: Ingredients,
                            attributes: ['ingredient_id', 'name', 'category_id'],
                            include: [
                                {
                                    model: Ingredient_Categories,
                                    attributes: ['category_id', 'category_name']
                                }
                            ]
                        },
                        {
                            model: Stores,
                            attributes: ['store_id', 'store_name', 'address', 'rating']
                        },
                    ]
                });
            } else if (data.ingredient_id) {
                ingredientPriceData = await Ingredient_Prices.findAndCountAll({
                    where: { ingredient_id: data.ingredient_id },
                    include: [
                        {
                            model: Ingredients,
                            attributes: ['ingredient_id', 'name', 'category_id'],
                            include: [
                                {
                                    model: Ingredient_Categories,
                                    attributes: ['category_id', 'category_name']
                                }
                            ]
                        },
                        {
                            model: Stores,
                            attributes: ['store_id', 'store_name', 'address', 'rating']
                        },
                    ]
                });
            } else if (data.store_id) {
                ingredientPriceData = await Ingredient_Prices.findAndCountAll({
                    where: { store_id: data.store_id },
                    include: [
                        {
                            model: Ingredients,
                            attributes: ['ingredient_id', 'name', 'category_id'],
                            include: [
                                {
                                    model: Ingredient_Categories,
                                    attributes: ['category_id', 'category_name']
                                }
                            ]
                        },
                        {
                            model: Stores,
                            attributes: ['store_id', 'store_name', 'address', 'rating']
                        },
                    ]
                });
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const search = data.search;

                if (page != 1 || limit != 10 || search) {
                    let ingredientCondition = {
                        model: Ingredients,
                        attributes: ['ingredient_id', 'name', 'category_id'],
                        include: [
                            {
                                model: Ingredient_Categories,
                                attributes: ['category_id', 'category_name']
                            }
                        ]
                    }
                    if (search) ingredientCondition['where'] = { name: { [Op.iLike]: `%${search}%` } };

                    ingredientPriceData = await Ingredient_Prices.findAndCountAll({
                        include: [
                            ingredientCondition,
                            {
                                model: Stores,
                                attributes: ['store_id', 'store_name', 'address', 'rating']
                            },
                        ],
                        offset: (page - 1) * limit,
                        limit: limit,
                        order: [['createdAt', 'DESC']],
                    });
                } else {
                    const isExists: any = await redis.getValue({ key: REDIS_KEYS.INGREDIENT_PRICE_LIST });
                    if (!isExists) {
                        ingredientPriceData = await Ingredient_Prices.findAndCountAll({
                            offset: (page - 1) * limit,
                            limit: limit,
                            order: [['createdAt', 'DESC']],
                            include: [
                                {
                                    model: Ingredients,
                                    attributes: ['ingredient_id', 'name', 'category_id'],
                                    include: [
                                        {
                                            model: Ingredient_Categories,
                                            attributes: ['category_id', 'category_name']
                                        }
                                    ]
                                },
                                {
                                    model: Stores,
                                    attributes: ['store_id', 'store_name', 'address', 'rating']
                                },
                            ]
                        });

                        await redis.setValue({ key: REDIS_KEYS.INGREDIENT_PRICE_LIST, value: { data: ingredientPriceData.rows, count: ingredientPriceData.count }, duration: ms(config.REDIS_TTL) });
                    } else {
                        ingredientPriceData['rows'] = isExists.data;
                        ingredientPriceData['count'] = isExists.count;
                    }
                }
            }

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.READ }), count: ingredientPriceData.count, data: ingredientPriceData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateIngredientPrice(data: any, url: string) {
        try {
            let updateDataObj = {};
            if (data.ingredient_id) {
                const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
                if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

                updateDataObj['ingredient_id'] = data.ingredient_id
            }

            if (data.store_id) {
                const isStoreExsits = await Stores.findOne({ where: { store_id: data.store_id } });
                if (!isStoreExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

                updateDataObj['store_id'] = data.store_id
            }

            await Ingredient_Prices.update({
                price: data.price,
                unit: data.unit,
                last_updated: data.last_updated
            }, { where: { price_id: data.price_id } });

            await redis.deleteKey({ key: REDIS_KEYS.INGREDIENT_PRICE_LIST });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteIngredientPrice(data: any, url: string) {
        try {
            await Ingredient_Prices.destroy({ where: { price_id: data.price_id } });
            await redis.deleteKey({ key: REDIS_KEYS.INGREDIENT_PRICE_LIST });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}