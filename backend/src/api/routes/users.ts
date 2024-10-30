import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { USER_SCHEMA } from '../schema/users';
import { IUsers } from '../Interfaces/IUsers';
import { isAuth } from '../middlewares/authorization';

const route = Router();

export default (app: Router) => {
    app.use('/user', route);

    route.put('/preference', isAuth, USER_SCHEMA.UPDATE, updatePreference);
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