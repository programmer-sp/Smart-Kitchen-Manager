import ms from 'ms';
import * as l10n from 'jm-ez-l10n';
import { Container } from 'typedi';
import config from '../../common/config';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { redis } from '../../common/services/redis';
import { Users } from '../../common/models/index';
import { setEncrypt } from '../../common/models/Users.model';
import { genHashToken, verifyPassword } from '../../common/services/Helper';
import { generateJWTToken } from '../../common/utils/JWTToken';
import { dynamicMailer } from '../../common/services/dynamicMailer';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from '../../common/utils/Constants';

export class IAuth {
    static async registration(data: any, url: string) {
        try {
            let moduleName = MODULE_NAME.USER, userType = data.role;

            const isExists = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()) } });
            if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: moduleName }) };

            const invitationToken = genHashToken(50);
            const userData = await Users.create({
                username: data.email.split('@')[0],
                email: data.email,
                password_hash: data.password_hash,
                role: data.role,
                invitation_token: invitationToken
            });

            if (userData) {
                const serviceMailer = new dynamicMailer();
                await serviceMailer.emailVerification({
                    receiverEmail: userData.email,
                    receiverName: `${userData.username}`,
                    invitationToken
                });
            }

            return { status: status_code.CREATED, message: l10n.t('VERFIY_EMAIL_SENT') };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "registration" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async login(data: any, url: string) {
        try {
            let moduleName: string = MODULE_NAME.USER;

            const userData = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()) } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_EXISTS', { key: moduleName }) };
            else if (!userData.status) return { status: status_code.BAD_REQUEST, message: l10n.t('SUSPEND_MESSAGE') };
            else if (!userData.email_verified) return { status: status_code.BAD_REQUEST, message: l10n.t('VERIFY_EMAIL') };

            let responseData = {};
            const check_pass = await verifyPassword(data['password_hash'], userData.password_hash);
            if (!check_pass) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_CREDENTIALS') };
            else responseData = {
                user_id: userData.user_id,
                username: userData.username,
                email: userData.email,
            };

            moduleName = (userData.role === 'administrator' ? MODULE_NAME.ADMIN : MODULE_NAME.USER).toLowerCase();
            const userAuthToken = await this.getUserTokens(responseData, { role: userData.role, type: moduleName });
            if (userAuthToken) responseData['token'] = userAuthToken;

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: moduleName, method: RESPONSE_METHOD.LOGGEDIN }), data: responseData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "login" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async logout(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            const moduleName = tokenData.type === 'admin' ? MODULE_NAME.ADMIN : MODULE_NAME.USER;
            let tokenExists: any = await redis.getValueByPattern({ key: `${REDIS_KEYS.USER_TOKEN}${tokenData.user_id}:` });
            if (tokenExists.count > 0) await redis.delKeyByPattern({ key: `${REDIS_KEYS.USER_TOKEN}${tokenData.user_id}:` });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: moduleName, method: RESPONSE_METHOD.LOGGEDOUT }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "logout" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async viewProfile(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            const moduleName = tokenData.type === 'admin' ? MODULE_NAME.ADMIN : MODULE_NAME.USER;
            const userData = await Users.findOne({
                where: {
                    user_id: tokenData.user_id
                },
                attributes: [
                    'user_id',
                    'username',
                    'email',
                    'role',
                ]
            });
            if (!userData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: moduleName }) };

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: moduleName, method: RESPONSE_METHOD.READ }), data: userData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "viewProfile" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async verifyEmail(invite_token: string, url: string) {
        try {
            let moduleName: string = MODULE_NAME.USER;

            const userData = await Users.findOne({ where: { invitation_token: invite_token } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('INVITATION_EXPIRED') };
            else if (!userData.status) return { status: status_code.BAD_REQUEST, message: l10n.t('SUSPEND_MESSAGE') };

            let responseData = { user_id: userData.user_id, username: userData.username, email: userData.email, role: userData.role };
            await Users.update({ invitation_token: null, email_verified: true }, { where: { user_id: userData.user_id } });

            moduleName = (userData.role === 'administrator' ? MODULE_NAME.ADMIN : MODULE_NAME.USER).toLowerCase();
            const userAuthToken = await this.getUserTokens(responseData, { role: userData.role, type: moduleName });
            if (userAuthToken) responseData['token'] = userAuthToken;

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: moduleName, method: RESPONSE_METHOD.VERIFIED }), data: responseData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "verifyEmail" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async reinviteVerification(data: any, url: string) {
        try {
            let moduleName = MODULE_NAME.USER;

            const userData = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()) } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_EXISTS', { key: moduleName }) };

            const invitationToken = genHashToken(50);
            await Users.update({ invitation_token: invitationToken, email_verified: false }, { where: { user_id: userData.user_id } });

            const serviceMailer = new dynamicMailer();
            await serviceMailer.emailVerification({
                receiverEmail: userData.email,
                receiverName: `${userData.username}`,
                invitationToken
            });

            return { status: status_code.OK, message: l10n.t('VERFIY_EMAIL_SENT') };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "reinviteVerification" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }



    static async getUserTokens(data: any, metaData: any) {
        return new Promise(async (resolve, reject) => {
            try {

                let token: string;
                let tokenSlug = `${REDIS_KEYS.USER_TOKEN}${data.user_id}:`;
                let tokenExists: any = await redis.getValueByPattern({ key: tokenSlug });
                if (tokenExists.count > 0) token = (Object.keys(tokenExists.data[0])[0]).split(':')[1];
                else token = await generateJWTToken({ user_id: data.user_id, email: data.email, username: data.username, role: metaData.role, type: metaData.type });

                await redis.setValue({ key: tokenSlug + token, value: true, duration: ms(config.JWT_TTL) });
                return resolve(token);
            } catch (error) {
                return reject({ e: error, routeName: "", functionName: "getUserTokens" });
            }
        });
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