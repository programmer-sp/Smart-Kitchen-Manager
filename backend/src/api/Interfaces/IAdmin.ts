import ms from 'ms';
import { Op } from 'sequelize';
import { Container } from 'typedi';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import logger from '../../common/loaders/logger';
import { uploadFile, deleteFile } from '../../common/loaders/multer';
import status_code from '../../common/utils/statusCode';
import { redis } from '../../common/services/redis';
import { isArrayOrObject } from '../../common/services/Helper';
import { setEncrypt } from '../../common/models/Users.model';
import {
    Users,
    Stores,
    Households,
    Household_Users,
    Ingredient_Categories,
    Ingredient_Prices,
    Ingredients,
    Recipes,
    Recipe_Ingredients,
    User_Ratings
} from '../../common/models/index';
import ingredientModel from '../../common/models/Ingredient_Details.model';
import recipeModel from '../../common/models/Recipe_Details.model';
import { dynamicMailer } from '../../common/services/dynamicMailer';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from '../../common/utils/Constants';

export class IAdmin {
    static async mailTemplate(data: any, url: string) {
        try {
            const receiverEmail = data.email ? data.email : config.DEV_EMAILS[0];
            const serviceMailer = new dynamicMailer();
            await serviceMailer.emailVerification({
                receiverEmail: receiverEmail,
                receiverName: "Backend-Team",
                invitationToken: "null"
            });

            return { status: status_code.OK, message: l10n.t('VERFIY_EMAIL_SENT') };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "mailTemplate" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- User API's ---------------------- */
    static async getUser(data: any, url: string) {
        try {

            if (data.user_id) {
                const userData = await Users.findOne({ where: { user_id: data.user_id }, attributes: ['user_id', 'username', 'email', 'role', 'status', 'email_verified', 'createdAt', 'updatedAt'] });
                if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_EXISTS', { key: MODULE_NAME.USER }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), data: userData };
            }

            // const tokenData: any = Container.get('auth-token');
            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search ? data.search.toLowerCase() : '';

            const condition: any = {
                attributes: ['user_id', 'username', 'email', 'role', 'status', 'email_verified', 'createdAt', 'updatedAt'],
                offset: search ? null : (page - 1) * limit,
                limit: search ? null : limit,
                order: [['createdAt', 'DESC']],
                // where: { user_id: { [Op.ne]: `${tokenData.user_id}` } }
            };

            let userData: any = await Users.findAndCountAll(condition);

            if (search) {
                userData.rows = userData.rows.filter(val => { return (val.email.toLowerCase().includes(search) || val.username.toLowerCase().includes(search) || val.role.toLowerCase().includes(search)) });
                userData.count = userData.rows.length;
            }

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), count: userData.count, data: userData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async activeInactiveUser(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');

            const userData = await Users.findOne({ where: { user_id: data.user_id } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.USER }) };
            else if (userData.user_id === tokenData.user_id) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
            else if (userData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Users.update({ status: data.active }, { where: { user_id: data.user_id } });

            if (!data.active) {
                const tokenSlug = `${userData.user_id}:`;
                let tokenExists: any = await redis.getValueByPattern({ key: tokenSlug });
                if (tokenExists.count > 0) await redis.delKeyByPattern({ key: tokenSlug });
            }

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateActiveInactive" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Store API's ---------------------- */
    static async addStore(data: any, url: string) {
        try {
            const isExsits = await Stores.findOne({ where: { store_name: { [Op.iLike]: `%${data.store_name}%` } } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.STORE }) };

            await Stores.create({ store_name: data.store_name, address: data.address });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addStore" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getStore(data: any, url: string) {
        try {
            if (data.store_id) {
                const storeData = await Stores.findOne({ where: { store_id: data.store_id } });
                if (!storeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.READ }), data: storeData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;
            const condition: any = {
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            };

            if (search) condition['where'] = { store_name: { [Op.iLike]: `%${search}%` } };
            let storeData = await Stores.findAndCountAll(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.READ }), count: storeData.count, data: storeData.rows };

        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getStore" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateStore(data: any, url: string) {
        try {
            const storeData = await Stores.findOne({ where: { store_id: data.store_id } });
            if (!storeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

            let updateDataObj = {};
            if (data.store_name) updateDataObj['store_name'] = data.store_name;
            if (data.address) updateDataObj['address'] = data.address;
            await Stores.update(updateDataObj, { where: { store_id: data.store_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateStore" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteStore(data: any, url: string) {
        try {
            const storeData = await Stores.findOne({ where: { store_id: data.store_id } });
            if (!storeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

            await Stores.destroy({ where: { store_id: data.store_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteStore" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Hosehold API's ---------------------- */
    static async addHousehold(data: any, url: string) {
        try {
            const isExists = await Households.findOne({ where: { household_name: data.household_name, status: true } });
            if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: data.household_name }) };

            await Households.create({ household_name: data.household_name, address: data.address });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getHousehold(data: any, url: string) {
        try {
            if (data.household_id) {
                const householdData = await Households.findOne({
                    where: { household_id: data.household_id },
                    include: [
                        {
                            model: Household_Users,
                            include: [
                                {
                                    model: Users,
                                    attributes: ['username', 'role', 'email'],
                                }
                            ]
                        },
                    ]
                });
                if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.READ }), data: householdData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;

            let condition: any = {};
            if (search) condition = { [Op.or]: [{ household_name: { [Op.iLike]: `%${search}%` } }, { address: { [Op.iLike]: `%${search}%` } }] };

            const householdData: any = await Households.findAll({
                where: condition,
                include: [
                    {
                        model: Household_Users,
                        include: [
                            {
                                model: Users,
                                attributes: ['username', 'role', 'email'],
                            }
                        ]
                    },
                ],
                offset: (page - 1) * limit,
                limit: limit,
                order: [['household_id', 'DESC']],
            });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.READ }), count: householdData.length, data: householdData };

        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateHousehold(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            let updateObj = {};
            if (data.address) updateObj['address'] = data.address;
            if (data.household_name) {
                const isExists = await Households.findOne({ where: { household_id: { [Op.ne]: data.household_id }, household_name: data.household_name, status: true } });
                if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: data.household_name }) };
                else updateObj['household_name'] = data.household_name;
            }
            await Households.update(updateObj, { where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteHousehold(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            await Households.destroy({ where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async activeInactiveHousehold(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (householdData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Households.update({ status: data.active }, { where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateActiveInactive" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Household User API's ---------------------- */
    static async addHouseholdUser(data: any, url: string) {
        try {
            // Note: It's not necessary for admin to be in a household to add user in it.

            const isHousehold = await Households.findOne({ where: { household_id: data.household_id } });
            if (!isHousehold) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (isHousehold.status === false) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_INACTIVE', { key: MODULE_NAME.HOUSEHOLD }) };

            const userData = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()) } });
            if (!userData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.USER }) };

            const isHouseholdUser = await Household_Users.findOne({ where: { user_id: userData.user_id, household_id: data.household_id } });
            if (isHouseholdUser) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.ADDED }) };

            await Household_Users.create({
                household_id: data.household_id,
                user_id: userData.user_id,
                role: data.role
            });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.ADDED }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getHouseholdUser(data: any, url: string) {
        try {
            if (data.household_user_id) {
                const responseData = await Household_Users.findOne({
                    where: { household_user_id: data.household_user_id },
                    include: [
                        {
                            model: Households,
                            attributes: ['household_name', 'address']
                        },
                        {
                            model: Users,
                            attributes: ['username', 'role', 'email'],
                        }
                    ]
                });

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), data: responseData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;

            let condition: any = {};
            if (search) {
                condition = {
                    [Op.or]: [
                        { household_name: { [Op.iLike]: `%${search}%` } },
                        { address: { [Op.iLike]: `%${search}%` } }
                    ]
                };
            }

            let responseData: any = await Household_Users.findAndCountAll({
                include: [
                    {
                        model: Households,
                        where: condition,
                        attributes: ['household_name', 'address']
                    },
                    {
                        model: Users,
                        attributes: ['username', 'role', 'email'],
                    }
                ],
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), count: responseData.count, data: responseData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateHouseholdUser(data: any, url: string) {
        try {
            // Note: It's not necessary for admin to be in a household to update user role in it.

            const householdUserData = await Household_Users.findOne({ where: { household_user_id: data.household_user_id } });
            if (!householdUserData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER }) };

            await Household_Users.update({ role: data.role }, { where: { household_user_id: data.household_user_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteHouseholdUser(data: any, url: string) {
        try {
            const householdUserData = await Household_Users.findOne({ where: { household_user_id: data.household_user_id } });
            if (!householdUserData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER }) };

            await Household_Users.destroy({ where: { household_user_id: data.household_user_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async activeInactiveHouseholdUser(data: any, url: string) {
        try {
            const householdUserData = await Household_Users.findOne({ where: { household_user_id: data.household_user_id } });
            if (!householdUserData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER }) };
            else if (householdUserData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Household_Users.update({ status: data.active }, { where: { household_user_id: data.household_user_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "activeInactiveHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Ingredient Category API's ---------------------- */
    static async addIngdCategory(data: any, url: string) {
        try {
            const isExsits = await Ingredient_Categories.findOne({ where: { category_name: { [Op.iLike]: `%${data.category_name}%` } } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY }) };

            await Ingredient_Categories.create({ category_name: data.category_name });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addIngdCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getIngdCategory(data: any, url: string) {
        try {
            if (data.category_id) {
                const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
                if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.READ }), data: categoryData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;
            const condition: any = {
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            };

            if (search) condition['where'] = { category_name: { [Op.iLike]: `%${search}%` } };
            let categoryData = await Ingredient_Categories.findAndCountAll(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.READ }), count: categoryData.count, data: categoryData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getIngdCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateIngdCategory(data: any, url: string) {
        try {
            const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
            if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY }) };

            await Ingredient_Categories.update({ category_name: data.category_name }, { where: { category_id: data.category_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateIngdCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteIngdCategory(data: any, url: string) {
        try {
            const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
            if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY }) };

            await Ingredient_Categories.destroy({ where: { category_id: data.category_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.CATEGORY, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteIngdCategory" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Ingredient Price API's ---------------------- */
    // TODO: Ingredient price will be added by store owner or someone who's role matches to organize store
    static async addIngredientPrice(data: any, url: string) {
        try {
            const isExsits = await Ingredient_Prices.findOne({ where: { ingredient_id: data.ingredient_id, store_id: data.store_id } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE }) };

            const isIngredientExsits = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!isIngredientExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            const isStoreExsits = await Stores.findOne({ where: { store_id: data.store_id } });
            if (!isStoreExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

            await Ingredient_Prices.create({
                ingredient_id: data.ingredient_id,
                store_id: data.store_id,
                price: data.price,
                unit: data.unit,
                last_updated: data.last_updated
            });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getIngredientPrice(data: any, url: string) {
        try {
            if (data.price_id) {
                const ingredientPriceData: any = await Ingredients.findOne({
                    attributes: ['ingredient_id', 'name', 'category_id'],
                    include: [
                        {
                            model: Ingredient_Prices,
                            where: { price_id: data.price_id },
                            attributes: ['price_id', 'ingredient_id', 'store_id', 'price', 'unit', 'last_updated'],
                            include: [
                                {
                                    model: Stores,
                                    attributes: ['store_id', 'store_name', 'address', 'rating']
                                },
                            ]
                        },
                        {
                            model: Ingredient_Categories,
                            attributes: ['category_id', 'category_name']
                        }
                    ],
                });

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.READ }), data: ingredientPriceData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;

            let ingredientCondition = {};
            if (search && !data.ingredient_id) ingredientCondition = { name: { [Op.iLike]: `%${search}%` } };
            else if (!search && data.ingredient_id) ingredientCondition = { ingredient_id: data.ingredient_id };
            else if (search && data.ingredient_id) ingredientCondition = {
                [Op.and]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { ingredient_id: data.ingredient_id },
                ]
            };

            const ingredientPriceData: any = await Ingredients.findAndCountAll({
                where: ingredientCondition,
                include: [
                    {
                        model: Ingredient_Prices,
                        required: true,
                        attributes: ['price_id', 'ingredient_id', 'store_id', 'price', 'unit', 'last_updated'],
                        include: [
                            {
                                model: Stores,
                                attributes: ['store_id', 'store_name', 'address', 'rating']
                            },
                        ]
                    },
                    {
                        model: Ingredient_Categories,
                        attributes: ['category_id', 'category_name']
                    }
                ],
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            });

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

                updateDataObj['ingredient_id'] = data.ingredient_id;
            }

            if (data.store_id) {
                const isStoreExsits = await Stores.findOne({ where: { store_id: data.store_id } });
                if (!isStoreExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

                updateDataObj['store_id'] = data.store_id;
            }

            updateDataObj['price'] = data.price;
            updateDataObj['unit'] = data.unit;
            updateDataObj['last_updated'] = data.last_updated;

            await Ingredient_Prices.update(updateDataObj, { where: { price_id: data.price_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteIngredientPrice(data: any, url: string) {
        try {
            await Ingredient_Prices.destroy({ where: { price_id: data.price_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Ingredient API's ---------------------- */
    static async addIngredient(data: any, url: string) {
        try {
            const isExsits = await Ingredients.findOne({ where: { name: { [Op.iLike]: `%${data.name}%` } } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.INGREDIENT }) };

            const isCategoryExsits = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
            if (!isCategoryExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

            const ingdData = await Ingredients.create({ name: data.name, category_id: data.category_id });

            if (!data.image) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT + ' image' }) };

            const uploadImage: any = await uploadFile(config.S3_INGD_FOLDER, data.image, 'public');
            await ingredientModel.create({
                ingredient_id: ingdData.ingredient_id,
                name: data.name,
                category: isCategoryExsits.category_name,
                unit: data.unit,
                value: parseFloat(data.value),
                image_url: uploadImage.key,
                nutritional_info: JSON.parse(data.nutritional_info)
            });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getIngredient(data: any, url: string) {
        try {
            if (data.ingredient_id) {
                let ingredientData: any = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id }, raw: true });
                if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

                ingredientData['ingredient_detail'] = await ingredientModel.findOne({ ingredient_id: data.ingredient_id }, { name: 1, category: 1, unit: 1, value: 1, image_url: 1, nutritional_info: 1 });

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), data: ingredientData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;
            const condition: any = {
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            };

            if (search && !data.category_id) condition['where'] = { name: { [Op.iLike]: `%${search}%` } };
            else if (!search && data.category_id) condition['where'] = { category_id: data.category_id };
            else if (search && data.category_id) condition['where'] = {
                [Op.and]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { category_id: data.category_id }
                ]
            };

            let ingredientData = await Ingredients.findAndCountAll(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count: ingredientData.count, data: ingredientData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateIngredient(data: any, url: string) {
        try {
            const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            let updateData: any = {}, updateObj: any = {};
            if (data.name) updateData.name = data.name, updateObj.name = data.name;
            if (data.category_id && data.category_id != ingredientData.category_id) {
                const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
                if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

                updateData['category_id'] = data.category_id;
                updateObj['category'] = categoryData.category_name;
            }
            await Ingredients.update(updateData, { where: { ingredient_id: data.ingredient_id } });

            if (data.image) {
                const uploadImage: any = await uploadFile(config.S3_INGD_FOLDER, data.image, 'public');
                updateObj.image_url = uploadImage.key;

                /* Delete old file in s3 */
                if (uploadImage.key) {
                    const ingdData = await ingredientModel.findOne({ ingredient_id: data.ingredient_id }).lean();
                    if (ingdData) deleteFile(ingdData.image_url);
                }
            }
            if (data.unit) updateObj.unit = data.unit;
            if (data.value) updateObj.value = parseFloat(data.value);
            if (data.nutritional_info) updateObj.nutritional_info = JSON.parse(data.nutritional_info);

            await ingredientModel.updateOne({ ingredient_id: data.ingredient_id }, updateObj);

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

            const ingdData = await ingredientModel.findOne({ ingredient_id: data.ingredient_id }).lean();
            if (ingdData) deleteFile(ingdData.image_url);

            await ingredientModel.deleteOne({ ingredient_id: data.ingredient_id });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteIngredient" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Recipe API's ---------------------- */
    static async addRecipe(data: any, url: string) {
        try {
            await Recipes.create({
                recipe_name: data.recipe_name,
                cuisine: data.cuisine,
                preparation_time: data.preparation_time,
                expiration_date: data.expiration_date,
                system_rating: data.system_rating
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

    static async updateRecipe(data: any, url: string) {
        try {
            const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
            if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

            let updateDataObj = {};
            if (data.recipe_name) updateDataObj['recipe_name'] = data.recipe_name;
            if (data.cuisine) updateDataObj['cuisine'] = data.cuisine;
            if (data.preparation_time) updateDataObj['preparation_time'] = data.preparation_time;
            if (data.system_rating) updateDataObj['system_rating'] = data.system_rating;
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

    /* ---------------------- Recipe Ingredient API's ---------------------- */
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
                const recipeIngdData = await Recipe_Ingredients.findOne({
                    where: { recipe_ingredient_id: data.recipe_ingredient_id },
                    attributes: ['recipe_id', 'ingredient_id', 'quantity', 'unit'],
                    include: [
                        {
                            model: Recipes,
                            attributes: ['recipe_name', 'cuisine', 'preparation_time', 'system_rating', 'expiration_date']
                        },
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
                });
                if (!recipeIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), data: recipeIngdData };

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

            let updateDataObj = {};
            if (data.recipe_id && recipeIngdData.recipe_id != data.recipe_id) {
                const recipeData = await Recipes.findOne({ where: { recipe_id: data.recipe_id } });
                if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };

                updateDataObj['recipe_id'] = data.recipe_id;
            }

            if (data.ingredient_id && recipeIngdData.ingredient_id != data.ingredient_id) {
                const ingredientData = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
                if (!ingredientData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

                updateDataObj['ingredient_id'] = data.ingredient_id;
            }

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

    /* ---------------------- Recipe Detail API's ---------------------- */
    static async addRecipeDetail(data: any, url: string) {
        try {
            let recipeData: any = await Recipes.findOne({
                where: { recipe_id: data.recipe_id },
                attributes: ['recipe_id', 'recipe_name', 'cuisine', 'preparation_time', 'system_rating', 'expiration_date', 'is_rated'],
                include: [
                    {
                        model: Recipe_Ingredients,
                        attributes: ['recipe_ingredient_id', 'recipe_id', 'ingredient_id', 'quantity', 'unit'],
                        include: [
                            {
                                model: Ingredients,
                                attributes: ['ingredient_id', 'name', 'category_id']
                            }
                        ]
                    }
                ]
            });
            if (!recipeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE }) };
            else recipeData = recipeData.toJSON();

            const ingredientArr = [];
            for (let i = 0; i < recipeData.Recipe_Ingredients.length; i++) {
                ingredientArr.push({
                    recipe_ingredient_id: recipeData.Recipe_Ingredients[i].recipe_ingredient_id,
                    recipe_id: recipeData.Recipe_Ingredients[i].recipe_id,
                    ingredient_id: recipeData.Recipe_Ingredients[i].ingredient_id,
                    quantity: recipeData.Recipe_Ingredients[i].quantity,
                    unit: recipeData.Recipe_Ingredients[i].unit,
                    ingredient_name: recipeData.Recipe_Ingredients[i].Ingredient?.name,
                    ingredient_category_id: recipeData.Recipe_Ingredients[i].Ingredient?.category_id,
                });
            }

            let ingdDetailData: any = {
                recipe_id: recipeData.recipe_id,
                recipe_name: recipeData.recipe_name,
                cuisine: recipeData.cuisine,
                preparation_time: recipeData.preparation_time,
                system_rating: recipeData.system_rating,
                is_rated: recipeData.is_rated,
                expiration_date: recipeData.expiration_date,
                ingredients: ingredientArr,
                steps: data.steps?.replace(/,\s+/g, ',').split(','),
                images: []
            };

            if (data.image) {
                const checkTypeOfObj = await isArrayOrObject(data.image);
                if (checkTypeOfObj == 'Object') {
                    const uploadImage: any = await uploadFile(config.S3_RECIPE_FOLDER, data.image, 'public');
                    ingdDetailData.images.push(uploadImage.url);
                } else if (checkTypeOfObj == 'Array') {
                    for (let i = 0; i < data.image.length; i++) {
                        const uploadImage: any = await uploadFile(config.S3_RECIPE_FOLDER, data.image[i], 'public');
                        ingdDetailData.images.push(uploadImage.url);
                    }
                }
            } else delete ingdDetailData.images;

            if (data.video_url) ingdDetailData.video_url = data.video_url;
            else if (data.video) {
                const uploadImage: any = await uploadFile(config.S3_RECIPE_FOLDER, data.video, 'public');
                ingdDetailData.video_url = uploadImage.url;
            }

            await recipeModel.create(ingdDetailData);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_DETAIL, method: RESPONSE_METHOD.ADDED }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addRecipeDetail" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getRecipeDetail(data: any, url: string) {
        try {
            if (data.recipe_id) {
                const recipeDetailData = await recipeModel.findOne({ recipe_id: data.recipe_id });
                if (!recipeDetailData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE_DETAIL }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_DETAIL, method: RESPONSE_METHOD.READ }), data: recipeDetailData };
            }

            const limit = data.limit ? +data.limit : 10
            const page = data.page ? (+data.page - 1) * limit : 0;

            let condition: any = { recipe_id: { $ne: null } };
            if (data.search) condition.$or = [
                { recipe_name: { $regex: new RegExp(data.search, "i") } },
                { cuisine: { $regex: new RegExp(data.search, "i") } },
            ];

            const recipeIngdData = await recipeModel.find(condition).sort({ createdAt: -1 }).skip(page).limit(limit);
            const totalRecipeData = await recipeModel.countDocuments(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_DETAIL, method: RESPONSE_METHOD.READ }), count: totalRecipeData, data: recipeIngdData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getRecipeDetail" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateRecipeDetail(data: any, url: string) {
        try {
            const recipeDetailData = await recipeModel.findOne({ recipe_id: data.recipe_id });
            if (!recipeDetailData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE_DETAIL }) };

            let ingdDetailData: any = { '$push': { images: [] } };
            if (data.steps) ingdDetailData.steps = data.steps?.replace(/,\s+/g, ',').split(',');

            if (data.image) {
                const checkTypeOfObj = await isArrayOrObject(data.image);
                if (checkTypeOfObj == 'Object') {
                    const uploadImage: any = await uploadFile(config.S3_RECIPE_FOLDER, data.image, 'public');
                    ingdDetailData['$push']['images'].push(uploadImage.url);
                } else if (checkTypeOfObj == 'Array') {
                    for (let i = 0; i < data.image.length; i++) {
                        const uploadImage: any = await uploadFile(config.S3_RECIPE_FOLDER, data.image[i], 'public');
                        ingdDetailData['$push']['images'].push(uploadImage.url);
                    }
                }
            } else delete ingdDetailData['$push'];

            if (data.video_url) ingdDetailData.video_url = data.video_url;
            else if (data.video) {
                const uploadImage: any = await uploadFile(config.S3_RECIPE_FOLDER, data.video, 'public');
                ingdDetailData.video_url = uploadImage.url;
            }

            await recipeModel.updateOne({ recipe_id: data.recipe_id }, ingdDetailData, { upsert: true });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_DETAIL, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateRecipeDetail" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteRecipeDetail(data: any, url: string) {
        try {
            const recipeDetailData = await recipeModel.findOne({ recipe_id: data.recipe_id });
            if (!recipeDetailData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE_DETAIL }) };

            /* Delete images uploaded into s3 bucket */
            for (const image of recipeDetailData.images || []) {
                await deleteFile(image.replace(config.S3_BUCKET_URL, ''));
            }

            /* Delete video uploaded into s3 bucket */
            if (recipeDetailData.video_url.includes(config.S3_BUCKET_NAME)) deleteFile(recipeDetailData.video_url.replace(config.S3_BUCKET_URL, ''));

            await recipeModel.deleteOne({ recipe_id: data.recipe_id });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_DETAIL, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteRecipeDetail" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    /* ---------------------- Recipe Rating API's ---------------------- */
    static async getRecipeRating(data: any, url: string) {
        try {
            if (data.rating_id) {
                const recipeRatingData = await User_Ratings.findOne({
                    where: { rating_id: data.rating_id },
                    include: [
                        {
                            model: Users,
                            attributes: ['username', 'role', 'email'],
                        },
                        {
                            model: Recipes,
                            attributes: ['recipe_name', 'cuisine', 'system_rating']
                        }
                    ]
                });
                if (!recipeRatingData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.RECIPE_RATING }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_RATING, method: RESPONSE_METHOD.READ }), data: recipeRatingData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;

            const recipeRatingData = await User_Ratings.findAndCountAll({
                attributes: ['recipe_id', 'rating_id', 'user_id', 'rating'],
                include: [
                    {
                        model: Users,
                        attributes: ['username', 'role', 'email'],
                    },
                    {
                        model: Recipes,
                        attributes: ['recipe_name', 'cuisine', 'system_rating']
                    }
                ],
                offset: (page - 1) * limit,
                limit: limit,
                order: data.rating_filter ? [['rating', data.rating_filter]] : [['createdAt', 'DESC']],
            });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.RECIPE_RATING, method: RESPONSE_METHOD.READ }), count: recipeRatingData.count, data: recipeRatingData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getRecipeRating" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }


    static async isAdmin(url: string) {
        return new Promise(async (resolve, reject) => {
            try {
                if (url.includes('admin')) return resolve(true);
                else return resolve(false);
            } catch (error) {
                return reject({ e: error, routeName: "", functionName: "isAdmin" });
            }
        });
    }
}