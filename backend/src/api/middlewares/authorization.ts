import { NextFunction, Request, Response } from 'express';
import * as crypto from 'crypto-js';
import * as l10n from 'jm-ez-l10n';
import * as jwt from 'jsonwebtoken';
import { Container } from 'typedi';

import config from '../../common/config';
import logger from '../../common/loaders/logger';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from "../../common/utils/Constants";
import status_code from "../../common/utils/statusCode";
import { redis } from '../../common/services/redis';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    // Get the jwt token from the head
    const headerToken = <string>req.headers['authorization'];
    if (!headerToken) return res.status(status_code.NOTFOUND).json({ status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: `${MODULE_NAME.AUTH} ${MODULE_NAME.TOKEN}` }) });
    else {
        const token = headerToken.split('Bearer ')[1];

        // Try to validate the token and get data
        jwt.verify(token, config.JWT_SECRET, async (err: any, decode: any) => {
            if (err) return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: l10n.t('AUTHORIZATION_MESSAGE') });

            const bytes = crypto.AES.decrypt(decode.sub, config.CIPHER_SECRET);
            const decryptedData = bytes.toString(crypto.enc.Utf8);
            res.locals.jwtPayload = JSON.parse(decryptedData);

            const authTo = req.headers['authType'];
            if ((authTo === 'admin' && res.locals.jwtPayload.type != 'admin') || (authTo === 'user' && res.locals.jwtPayload.type != 'user')) return res.status(status_code.UNAUTHORISED).json({ status: status_code.UNAUTHORISED, message: l10n.t('UNAUTHORIZED') });

            const reply = await redis.existKeys({ key: `${REDIS_KEYS.USER_TOKEN}${res.locals.jwtPayload.user_id}:${token}` });
            if (reply) {
                Container.set('auth-token', res.locals.jwtPayload);
                Container.set('token-string', token);
                next();
            } else return res.status(status_code.UNAUTHORISED).json({ status: status_code.UNAUTHORISED, message: l10n.t('SESSION_OUT') });
        });
    }
};

export const isModifiedAuth = (req: Request, res: Response, next: NextFunction) => {
    // Get the jwt token from the head
    const headerToken = <string>req.headers['authorization'];
    if (!headerToken) {
        Container.set('empty-token', true);
        next();
    } else {
        const token = headerToken.split('Bearer ')[1];

        // Try to validate the token and get data
        jwt.verify(token, config.JWT_SECRET, async (err: any, decode: any) => {
            if (err) return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: l10n.t('AUTHORIZATION_MESSAGE') });

            const bytes = crypto.AES.decrypt(decode.sub, config.CIPHER_SECRET);
            const decryptedData = bytes.toString(crypto.enc.Utf8);
            res.locals.jwtPayload = JSON.parse(decryptedData);

            const authTo = req.headers['authType'];
            if ((authTo === 'admin' && res.locals.jwtPayload.type != 'admin') || (authTo === 'user' && res.locals.jwtPayload.type != 'user')) return res.status(status_code.UNAUTHORISED).json({ status: status_code.UNAUTHORISED, message: l10n.t('UNAUTHORIZED') });

            const reply = await redis.existKeys({ key: `${REDIS_KEYS.USER_TOKEN}${res.locals.jwtPayload.user_id}:${token}` });
            if (reply) {
                Container.set('auth-token', res.locals.jwtPayload);
                Container.set('token-string', token);
                Container.set('empty-token', false);
                next();
            } else return res.status(status_code.UNAUTHORISED).json({ status: status_code.UNAUTHORISED, message: l10n.t('SESSION_OUT') });
        });
    }
};

// -------------------------------------------------------------------------------- for backend use only
export const getDataByPattern = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const redis_keys = await redis.getValueByPattern({ key: `${req.query.slug}` });
        return res.status(status_code.OK).json({ status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.REDIS_DATA, method: RESPONSE_METHOD.READ }), count: 0, data: redis_keys });
    } catch (e) {
        return res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG'), error: e });
    }
};

export const unwrapToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const headerToken = <string>req.headers['authorization'];
        if (!headerToken) return res.status(status_code.NOTFOUND).json({ status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.REDIS_DATA }) });
        else {
            const token = headerToken.split('Bearer ')[1];

            const tokenData: any = jwt.verify(token, config.JWT_SECRET, (err: any, decode: any) => {
                if (err) return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: l10n.t('AUTHORIZATION_MESSAGE') });

                res.locals.jwtTTL = { exp: decode.exp, jwt: token };
                const bytes = crypto.AES.decrypt(decode.sub, config.CIPHER_SECRET);
                const decryptedData = bytes.toString(crypto.enc.Utf8);
                return JSON.parse(decryptedData);
            });
            if (tokenData) return res.status(status_code.OK).json({ status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.REDIS_DATA, method: RESPONSE_METHOD.READ }), data: tokenData });
            else return res.status(status_code.UNAUTHORISED).json({ status: status_code.UNAUTHORISED, message: l10n.t('SESSION_OUT') });
        }
    } catch (e) {
        return res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG'), error: e });
    }
};

export const deleteKeyData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await redis.delKeyByPattern({ key: `${req.query.slug}` });
        return res.status(status_code.OK).json({ status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.REDIS_DATA, method: RESPONSE_METHOD.UPDATE }) });
    } catch (e) {
        return res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG'), error: e });
    }
};

export const clearCacheData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await redis.flushallKeys({ key: null });
        return res.status(status_code.OK).json({ status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.REDIS_DATA, method: RESPONSE_METHOD.UPDATE }) });
    } catch (e) {
        logger.error(e);
        return res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG'), error: e });
    }
};
// -------------------------------------------------------------------------------- for backend use only