import ms from 'ms';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import { Container } from 'typedi';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { Users } from '../../common/models/index';
import userPreferencesModel from '../../common/models/User_Preferences.model';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from '../../common/utils/Constants';
import { redis } from '../../common/services/redis';

export class IUsers {
    static async updatePreference(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            let dietary_restrictions = data.dietary_restrictions.split(',');
            let preferred_cuisines = data.preferred_cuisines.split(',');

            const preferenceData = await userPreferencesModel.findOne({ user_id: tokenData.user_id });
            if (!preferenceData) await userPreferencesModel.create({ user_id: tokenData.user_id, dietary_restrictions, preferred_cuisines });
            else if (JSON.stringify(preferenceData.dietary_restrictions) != JSON.stringify(dietary_restrictions) || JSON.stringify(preferenceData.preferred_cuisines) != JSON.stringify(preferred_cuisines)) await userPreferencesModel.updateOne({ user_id: tokenData.user_id }, { dietary_restrictions, preferred_cuisines });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updatePreference" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

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
}