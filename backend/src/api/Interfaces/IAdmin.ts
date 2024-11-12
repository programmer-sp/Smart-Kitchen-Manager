import ms from 'ms';
import { Op } from 'sequelize';
import { Container } from 'typedi';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { redis } from '../../common/services/redis';
import { setEncrypt } from '../../common/models/Users.model';
import {
    Users,
    Stores,
    Households,
    Household_Users,
    Ingredient_Categories,
    Ingredient_Prices,
    Ingredients
} from '../../common/models/index';
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
                const userData = await Users.findOne({ where: { user_id: data.user_id } });
                if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_EXISTS', { key: MODULE_NAME.USER }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), data: userData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search ? data.search.toLowerCase() : '';

            const isExists: any = await redis.getValue({ key: REDIS_KEYS.USER_LIST });

            let userData: any = {};
            if (page != 1 || limit != 10 || search || !isExists) {

                const condition: any = {
                    attributes: ['user_id', 'username', 'email', 'role', 'status', 'email_verified', 'createdAt', 'updatedAt'],
                    offset: search ? null : (page - 1) * limit,
                    limit: search ? null : limit,
                    order: [['createdAt', 'DESC']],
                };

                userData = await Users.findAndCountAll(condition);

                if (search) {
                    userData.rows = userData.rows.filter(val => { return (val.email.toLowerCase().includes(search) || val.username.toLowerCase().includes(search) || val.role.toLowerCase().includes(search)) });
                    userData.count = userData.rows.length;
                }

                if (page === 1 && limit === 10 && !search) await redis.setValue({ key: REDIS_KEYS.USER_LIST, value: { data: userData.rows, count: userData.count }, duration: ms(config.REDIS_TTL) });
            } else {
                userData.count = isExists.count;
                userData.rows = isExists.data;
            }

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), count: userData.count, data: userData.rows };

        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async activeInactiveUser(data: any, url: string) {
        try {
            const userData = await Users.findOne({ where: { user_id: data.user_id } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.USER }) };
            else if (userData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Users.update({ status: data.active }, { where: { user_id: data.user_id } });

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
                const householdData = await Household_Users.findOne({
                    where: { household_id: data.household_id },
                    include: [
                        {
                            model: Households
                        },
                        {
                            model: Users,
                            attributes: ['username', 'role', 'email'],
                        }
                    ]
                });
                if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.READ }), data: householdData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;
            const condition: any = {
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            };

            if (search) condition['where'] = { household_name: { [Op.iLike]: `%${search}%` }, address: { [Op.iLike]: `%${search}%` } };
            let householdData = await Households.findAndCountAll(condition);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.READ }), count: householdData.count, data: householdData.rows };

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
            const tokenData: any = Container.get('auth-token');
            const restrictedUser = ['guest', 'content creator', 'viewer'];
            if (restrictedUser.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.ADD }) };

            // Note: It's not necessary for admin to be in a household to add user in it.

            const userData = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()) } });
            if (!userData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.USER }) };

            const isHousehold = await Households.findOne({ where: { household_id: data.household_id } });
            if (!isHousehold) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (isHousehold.status === false) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_INACTIVE', { key: MODULE_NAME.HOUSEHOLD }) };

            const isHouseholdUser = await Household_Users.findOne({ where: { user_id: userData.user_id, household_id: data.household_id } });
            if (isHouseholdUser) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.ADDED }) };

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
            const condition: any = {
                offset: (page - 1) * limit,
                limit: limit,
                order: [['createdAt', 'DESC']],
            };

            if (search) condition['where'] = { email: { [Op.iLike]: `%${search}%` }, username: { [Op.iLike]: `%${search}%` }, household_name: { [Op.iLike]: `%${search}%` }, address: { [Op.iLike]: `%${search}%` } };
            let responseData = await Household_Users.findAndCountAll({
                where: condition,
                include: [
                    {
                        model: Households,
                        where: condition,
                        attributes: ['household_name', 'address']
                    },
                    {
                        model: Users,
                        where: condition,
                        attributes: ['username', 'role', 'email'],
                    }
                ]
            });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), count: responseData.count, data: responseData.rows };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateHouseholdUser(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            const restrictedUser = ['guest', 'content creator', 'viewer'];
            if (restrictedUser.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.ADD }) };

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
    // TODO: Ingredient price will be added by store owner or someone whoes role matches to organize store
    static async addIngredientPrice(data: any, url: string) {
        try {
            const isExsits = await Ingredient_Prices.findOne({ where: { ingredient_id: data.ingredient_id, store_id: data.store_id } });
            if (isExsits) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE }) };

            const isIngredientExsits = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!isIngredientExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            const isStoreExsits = await Stores.findOne({ where: { store_id: data.store_id } });
            if (!isStoreExsits) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

            await Ingredient_Prices.create({ ingredient_id: data.ingredient_id, store_id: data.store_id, price: data.price, unit: data.unit, last_updated: data.last_updated });

            return { status: status_code.CREATED, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addIngredientPrice" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getIngredientPrice(data: any, url: string) {
        try {

            if (data.price_id) {
                const ingredientPriceData = await Ingredient_Prices.findOne({
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

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT + ' ' + MODULE_NAME.PRICE, method: RESPONSE_METHOD.READ }), data: ingredientPriceData };
            }

            const page = +data.page || 1;
            const limit = +data.limit || 10;
            const search = data.search;

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

            let ingredientPriceData = await Ingredient_Prices.findAndCountAll({
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

            await Ingredients.create({ name: data.name, category_id: data.category_id });

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

            if (search) condition['where'] = { name: { [Op.iLike]: `%${search}%` } };

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

            let updateData = { name: data.name };
            if (data.category_id != ingredientData.category_id) {
                const categoryData = await Ingredient_Categories.findOne({ where: { category_id: data.category_id } });
                if (!categoryData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.CATEGORY }) };

                updateData['category_id'] = data.category_id;
            }
            await Ingredients.update(updateData, { where: { ingredient_id: data.ingredient_id } });

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

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteIngredient" });
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