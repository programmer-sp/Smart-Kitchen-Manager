import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { IAuth } from '../Interfaces/IAuth';
import {
    clearCacheData,
    deleteKeyData,
    getDataByPattern,
    unwrapToken
} from '../middlewares/authorization';

const route = Router();

export default (app: Router) => {
    app.use('/admin', route);

    // ------------------------------------------------------- for backend use only
    route.get('/get-pattern-data', getDataByPattern);
    route.get('/unwrap-token', unwrapToken);
    route.get('/delete-keys', deleteKeyData);
    route.get('/clear-cache', clearCacheData);
    route.get('/mail-template', mailTemplate);
};

async function mailTemplate(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data: string = req.query;
    IAuth.mailTemplate(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}