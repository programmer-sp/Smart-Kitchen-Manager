import ms from 'ms';
import { Op } from 'sequelize';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { redis } from '../../common/services/redis';
import { Users, Stores } from '../../common/models/index';
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

    static async updateActiveInactive(data: any, url: string) {
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
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const search = data.search;
                const condition: any = {
                    offset: (page - 1) * limit,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                };

                let storeData: any = [];
                if (search) condition['where'] = { store_name: { [Op.iLike]: `%${search}%` } };
                storeData = await Stores.findAndCountAll(condition);

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.READ }), count: storeData.count, data: storeData.rows };
            }
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