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
            let moduleName = MODULE_NAME.USER, userType = 'user';
            const adminFlag = await IAuth.isAdmin(url);
            if (adminFlag) {
                moduleName = MODULE_NAME.ADMIN;
                userType = 'admin';
            }

            const isExists = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()), type: userType } });
            if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: moduleName }) };

            const invitationToken = genHashToken(50);
            const userData = await Users.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                type: userType,
                invitationToken
            });
            if (userData) {
                const serviceMailer = new dynamicMailer();
                await serviceMailer.emailVerification({
                    receiverEmail: userData.email,
                    receiverName: `${userData.firstName} ${userData.lastName}`,
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
            let moduleName = MODULE_NAME.USER, userType = 'user';
            const adminFlag = await IAuth.isAdmin(url);
            if (adminFlag) {
                moduleName = MODULE_NAME.ADMIN;
                userType = 'admin';
            }

            const userData = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()), type: userType } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_EXISTS', { key: moduleName }) };
            else if (!userData.status) return { status: status_code.BAD_REQUEST, message: l10n.t('SUSPEND_MESSAGE') };
            else if (!userData.emailVerified) return { status: status_code.BAD_REQUEST, message: l10n.t('VERIFY_EMAIL') };

            let responseData = {};
            const check_pass = await verifyPassword(data['password'], userData.password);
            if (!check_pass) return { status: status_code.BAD_REQUEST, message: l10n.t('INVALID_CREDENTIALS') };
            else responseData = {
                _id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
            };

            const userAuthToken = await this.getUserTokens(responseData, userData.type);
            if (userAuthToken) responseData['token'] = userAuthToken;

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: moduleName, method: RESPONSE_METHOD.LOGGEDIN }), data: responseData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "login" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async viewProfile(data: any, url: string) {
        try {
            let moduleName = MODULE_NAME.USER, userType = 'user';

            const tokenData: any = Container.get('auth-token');
            if (tokenData.type != 'user') {
                moduleName = MODULE_NAME.ADMIN;
                userType = 'admin';
            }

            const userData = await Users.findOne({
                where: {
                    id: tokenData.id
                },
                attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'email',
                    'cellPhone',
                    'gender',
                    'age',
                    'address'
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
            let moduleName = MODULE_NAME.USER, userType = 'user';
            const adminFlag = await IAuth.isAdmin(url);
            if (adminFlag) {
                moduleName = MODULE_NAME.ADMIN;
                userType = 'admin';
            }

            const userData = await Users.findOne({ where: { invitationToken: invite_token, type: userType } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('INVITATION_EXPIRED') };
            else if (!userData.status) return { status: status_code.BAD_REQUEST, message: l10n.t('SUSPEND_MESSAGE') };

            let responseData = { _id: userData.id, firstName: userData.firstName, lastName: userData.lastName, email: userData.email, };
            await Users.update({ invitationToken: null, emailVerified: true }, { where: { id: userData.id } });

            const userAuthToken = await this.getUserTokens(responseData, userData.type);
            if (userAuthToken) responseData['token'] = userAuthToken;

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: moduleName, method: RESPONSE_METHOD.VERIFIED }), data: responseData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "verifyEmail" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async reinviteVerification(data: any, url: string) {
        try {
            let moduleName = MODULE_NAME.USER, userType = 'user';
            const adminFlag = await IAuth.isAdmin(url);
            if (adminFlag) {
                moduleName = MODULE_NAME.ADMIN;
                userType = 'admin';
            }

            const userData = await Users.findOne({ where: { email: setEncrypt(data['email'].toLowerCase()), type: userType } });
            if (!userData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_EXISTS', { key: moduleName }) };

            const invitationToken = genHashToken(50);
            await Users.update({ invitationToken, emailVerified: false }, { where: { id: userData.id } });

            const serviceMailer = new dynamicMailer();
            await serviceMailer.emailVerification({
                receiverEmail: userData.email,
                receiverName: `${userData.firstName} ${userData.lastName}`,
                invitationToken
            });

            return { status: status_code.OK, message: l10n.t('VERFIY_EMAIL_SENT') };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "reinviteVerification" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

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



    static async getUserTokens(data: any, type: string) {
        return new Promise(async (resolve, reject) => {
            try {

                let token: string;
                let tokenSlug = `${REDIS_KEYS.USER_TOKEN}${data._id}:`;
                let tokenExists: any = await redis.getValueByPattern({ key: tokenSlug });
                if (tokenExists.count > 0) token = (Object.keys(tokenExists.data[0])[0]).split(':')[1];
                else token = await generateJWTToken({ id: data._id, email: data.email, name: data.name, type });

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