import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { IAdmin } from '../Interfaces/IAdmin';
import {
    isAuth,
    clearCacheData,
    deleteKeyData,
    getDataByPattern,
    unwrapToken
} from '../middlewares/authorization';
import { ADMIN_SCHEMA } from '../schema/admin';

const route = Router();

export default (app: Router) => {
    app.use('/admin', route);

    /* ---------------------- User API's ---------------------- */
    route.get('/get-user', ADMIN_SCHEMA.READ_USER, isAuth, getUser);
    route.patch('/update-user/:user_id', ADMIN_SCHEMA.PATCH_USER, isAuth, updateActiveInactive);

    /* ---------------------- Store API's ---------------------- */
    route.post('/add-store', ADMIN_SCHEMA.CREATE_STORE, isAuth, addStore);
    route.get('/get-store', ADMIN_SCHEMA.READ_STORE, isAuth, getStore);
    route.put('/update-store/:store_id', ADMIN_SCHEMA.UPDATE_STORE, isAuth, updateStore);
    route.delete('/delete-store', ADMIN_SCHEMA.DELETE_STORE, isAuth, deleteStore);

    // -------------------------------------------------------- for backend use only
    route.get('/get-pattern-data', getDataByPattern);
    route.get('/unwrap-token', unwrapToken);
    route.get('/delete-keys', deleteKeyData);
    route.get('/clear-cache', clearCacheData);
    route.get('/mail-template', mailTemplate);
};

async function mailTemplate(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data: string = req.query;
    IAdmin.mailTemplate(data, url)
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
    IAdmin.getUser(data, url)
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
    IAdmin.updateActiveInactive(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function addStore(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAdmin.addStore(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getStore(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.getStore(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateStore(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['store_id'] = req.params.store_id;
    IAdmin.updateStore(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteStore(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.deleteStore(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}