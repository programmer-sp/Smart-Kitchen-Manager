import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { USER_SCHEMA } from '../schema/users';
import { IUsers } from '../Interfaces/IUsers';
import { isAuth } from '../middlewares/authorization';

const route = Router();
const userAuth = (req: Request, res: Response, next: any) => { Object.assign(req.headers, { authType: "user" }); next(); };
const adminAuth = (req: Request, res: Response, next: any) => { Object.assign(req.headers, { authType: "admin" }); next(); };
const commonAuth = (req: Request, res: Response, next: any) => { Object.assign(req.headers, { authType: "common" }); next(); };

export default (app: Router) => {
    app.use('/user', route);

    route.put('/preference', USER_SCHEMA.UPDATE, userAuth, isAuth, updatePreference);
    route.get('/', USER_SCHEMA.READ, adminAuth, isAuth, getUser);
    route.patch('/:user_id', USER_SCHEMA.PATCH, adminAuth, isAuth, updateActiveInactive);
};

async function updatePreference(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IUsers.updatePreference(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IUsers.getUser(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateActiveInactive(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['user_id'] = req.params.user_id;
    IUsers.updateActiveInactive(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}