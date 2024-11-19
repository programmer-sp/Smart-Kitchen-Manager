import * as l10n from 'jm-ez-l10n';
import logger from '../../common/loaders/logger';
import { Container } from 'typedi';
import status_code from '../../common/utils/statusCode';
import { setEncrypt } from '../../common/models/Users.model';
import {
    Households,
    Household_Users,
    Ingredients,
    Household_Ingredients,
    Users,
    Ingredient_Categories
} from '../../common/models/index';
import { MODULE_NAME, RESPONSE_METHOD, RESTRICTED_USER } from '../../common/utils/Constants';
import { Op } from 'sequelize';

export class IHouseholds {
    static async addHousehold(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.ADD }) };

            const isExists = await Households.findOne({ where: { household_name: data.household_name, status: true } });
            if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: data.household_name }) };

            const householdData = await Households.create({ household_name: data.household_name, address: data.address });

            await Household_Users.create({
                household_id: householdData.household_id,
                user_id: tokenData.user_id,
                role: 'owner'
            });

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

            const tokenData: any = Container.get('auth-token');
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
                        where: { user_id: tokenData.user_id },
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
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.UPDATE }) };

            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            const householdUserRole = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: data.household_id } });
            if (!householdUserRole || RESTRICTED_USER.includes(householdUserRole.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.UPDATE }) };

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
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.DELETE }) };

            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            const householdUser = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: data.household_id } });
            if (!householdUser || RESTRICTED_USER.includes(householdUser.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.DELETE }) };

            await Households.destroy({ where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateActiveInactive(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (householdData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            const householdUser = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: data.household_id } });
            if (!householdUser || RESTRICTED_USER.includes(householdUser.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Households.update({ status: data.active }, { where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateActiveInactive" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }



    static async addHouseholdUser(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.ADD }) };

            const isHousehold = await Households.findOne({ where: { household_id: data.household_id } });
            if (!isHousehold) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (isHousehold.status === false) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_INACTIVE', { key: MODULE_NAME.HOUSEHOLD }) };

            const householdUserRole = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: data.household_id } });
            if (!householdUserRole || RESTRICTED_USER.includes(householdUserRole.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.ADD }) };

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
            let responseData = {};
            let count = 0;
            if (data.household_user_id) {
                responseData = await Household_Users.findOne({
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
                count = responseData ? 1 : 0;
            } else if (data.household_id) {
                let tempData = await Household_Users.findAndCountAll({
                    where: { household_id: data.household_id },
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
                responseData = tempData.rows;
                count = tempData.count;
            }

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.READ }), count, data: responseData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateHouseholdUser(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.UPDATE }) };

            const householdUserData = await Household_Users.findOne({ where: { household_user_id: data.household_user_id } });
            if (!householdUserData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER }) };

            const householdUserRole = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: householdUserData.household_id } });
            if (!householdUserRole || RESTRICTED_USER.includes(householdUserRole.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.UPDATE }) };

            await Household_Users.update({ role: data.role }, { where: { household_user_id: data.household_user_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteHouseholdUser(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.DELETE }) };

            const householdUserData = await Household_Users.findOne({ where: { household_user_id: data.household_user_id } });
            if (!householdUserData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER }) };

            const householdUserRole = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: householdUserData.household_id } });
            if (!householdUserRole || RESTRICTED_USER.includes(householdUserRole.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.DELETE }) };

            await Household_Users.destroy({ where: { household_user_id: data.household_user_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async activeInactiveHouseholdUser(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            const householdUserData = await Household_Users.findOne({ where: { household_user_id: data.household_user_id } });
            if (!householdUserData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER }) };
            else if (householdUserData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            const householdUser = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: householdUserData.household_id } });
            if (!householdUser || RESTRICTED_USER.includes(householdUser.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Household_Users.update({ status: data.active }, { where: { household_user_id: data.household_user_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.USER, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "activeInactiveHouseholdUser" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }



    static async addHouseholdIngd(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.ADD }) };

            const isHousehold = await Households.findOne({ where: { household_id: data.household_id } });
            if (!isHousehold) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (isHousehold.status === false) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_INACTIVE', { key: MODULE_NAME.HOUSEHOLD }) };

            const isHouseholdUser = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: data.household_id } });
            if (!isHouseholdUser || RESTRICTED_USER.includes(isHouseholdUser.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.ADD }) };
            else if (isHouseholdUser.status === false) return { status: status_code.ACCESS_LOCKED, message: l10n.t('COMMON_NO_ACCESS', { key: RESPONSE_METHOD.ADD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.REMOVED }) };

            const isIngredient = await Ingredients.findOne({ where: { ingredient_id: data.ingredient_id } });
            if (!isIngredient) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.INGREDIENT }) };

            let insertDataObj = {
                household_id: data.household_id,
                ingredient_id: data.ingredient_id,
                quantity: data.quantity,
            };
            if (data.unit) insertDataObj['unit'] = data.unit;
            if (data.expiration_date) insertDataObj['expiration_date'] = data.expiration_date;
            await Household_Ingredients.create(insertDataObj);

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.ADDED }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "addHouseholdIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getHouseholdIngd(data: any, url: string) {
        try {
            let responseData = {};
            let count = 0;
            if (data.household_ingredient_id) {
                responseData = await Household_Ingredients.findOne({
                    where: { household_ingredient_id: data.household_ingredient_id },
                    attributes: ['household_ingredient_id', 'ingredient_id', 'quantity', 'unit', 'is_expired', 'expiration_date'],
                    include: [
                        {
                            model: Households,
                            attributes: ['household_name', 'address']
                        },
                        {
                            model: Ingredients,
                            attributes: ['ingredient_id', 'name', 'category_id'],
                            include: [
                                {
                                    model: Ingredient_Categories,
                                    attributes: ['category_id', 'category_name']
                                }
                            ]
                        }
                    ]
                });
                count = responseData ? 1 : 0;
            } else if (data.household_id) {
                let tempData = await Household_Ingredients.findAndCountAll({
                    where: { household_id: data.household_id },
                    attributes: ['household_ingredient_id', 'ingredient_id', 'quantity', 'unit', 'is_expired', 'expiration_date'],
                    include: [
                        {
                            model: Households,
                            attributes: ['household_id', 'household_name', 'address']
                        },
                        {
                            model: Ingredients,
                            attributes: ['ingredient_id', 'name', 'category_id'],
                            include: [
                                {
                                    model: Ingredient_Categories,
                                    attributes: ['category_id', 'category_name']
                                }
                            ]
                        }
                    ]
                });
                responseData = tempData.rows;
                count = tempData.count;
            } else {
                const tokenData: any = Container.get('auth-token');
                const HouseholdIngdData: any = await Household_Users.findAll({
                    where: { user_id: tokenData.user_id },
                    attributes: ['household_user_id', 'household_id', 'role', 'status'],
                    include: [
                        {
                            model: Households,
                            attributes: ['household_name', 'address'],
                            include: [
                                {
                                    model: Household_Ingredients,
                                    attributes: ['household_ingredient_id', 'ingredient_id', 'quantity', 'unit', 'is_expired', 'expiration_date'],
                                    include: [
                                        {
                                            model: Ingredients,
                                            attributes: ['ingredient_id', 'name', 'category_id'],
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                });
                responseData = HouseholdIngdData;
                count = HouseholdIngdData.length;
            }

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.READ }), count, data: responseData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getHouseholdIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateHouseholdIngd(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.UPDATE }) };

            const HouseholdIngdData = await Household_Ingredients.findOne({ where: { household_ingredient_id: data.household_ingredient_id } });
            if (!HouseholdIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT }) };

            const isHouseholdUser = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: HouseholdIngdData.household_id } });
            if (!isHouseholdUser || RESTRICTED_USER.includes(isHouseholdUser.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.UPDATE }) };
            else if (isHouseholdUser.status === false) return { status: status_code.ACCESS_LOCKED, message: l10n.t('COMMON_NO_ACCESS', { key: RESPONSE_METHOD.UPDATE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.REMOVED }) };

            let updateData = {};
            if (data.quantity) updateData['quantity'] = data.quantity;
            if (data.unit) updateData['unit'] = data.unit;
            if (data.expiration_date) updateData['expiration_date'] = data.expiration_date;
            if (data.is_expired === true || false) updateData['is_expired'] = data.is_expired;

            await Household_Ingredients.update({ quantity: data.quantity, unit: data.unit, expiration_date: data.expiration_date, is_expired: data.is_expired }, { where: { household_ingredient_id: data.household_ingredient_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateHouseholdIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteHouseholdIngd(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            if (RESTRICTED_USER.includes(tokenData.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };

            const HouseholdIngdData = await Household_Ingredients.findOne({ where: { household_ingredient_id: data.household_ingredient_id } });
            if (!HouseholdIngdData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT }) };

            const isHouseholdUser = await Household_Users.findOne({ where: { user_id: tokenData.user_id, household_id: HouseholdIngdData.household_id } });
            if (!isHouseholdUser || RESTRICTED_USER.includes(isHouseholdUser.role)) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_PERMISSION', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };
            else if (isHouseholdUser.status === false) return { status: status_code.ACCESS_LOCKED, message: l10n.t('COMMON_NO_ACCESS', { key: RESPONSE_METHOD.DELETE + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.REMOVED }) };

            await Household_Ingredients.destroy({ where: { household_ingredient_id: data.household_ingredient_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD + ' ' + MODULE_NAME.INGREDIENT, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteHouseholdIngd" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}