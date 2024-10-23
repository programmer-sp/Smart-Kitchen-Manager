import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { AUTH_SCHEMA } from '../schema/auth';
import { IAuth } from '../Interfaces/IAuth';
import { isAuth } from '../middlewares/authorization';

const route = Router();

export default (app: Router) => {
    app.use('/auth', route);

    route.post('/registration', AUTH_SCHEMA.REGISTRATION, registration);
    route.post('/login', AUTH_SCHEMA.LOGIN, login);
    route.get('/profile', isAuth, viewProfile);
    route.get('/verify-email', verifyEmail);
    route.post('/reinvite-email', reinviteVerification);
    route.get('/logout', isAuth, logout);
};

async function registration(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAuth.registration(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function login(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAuth.login(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function logout(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    IAuth.logout(null, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function viewProfile(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.params;
    IAuth.viewProfile(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function verifyEmail(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const invite_token: string = req.query.invite_token;
    IAuth.verifyEmail(invite_token, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function reinviteVerification(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data: string = req.body;
    IAuth.reinviteVerification(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}