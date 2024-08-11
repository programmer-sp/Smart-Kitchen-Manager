import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { HOUSEHOLD_SCHEMA } from '../schema/household';
import { IHouseholds } from '../Interfaces/IHousehold';
import { isAuth } from '../middlewares/authorization';

const route = Router();

export default (app: Router) => {
    app.use('/household', route);

    route.post('/', HOUSEHOLD_SCHEMA.CREATE, isAuth, createHousehold);
    route.get('/', HOUSEHOLD_SCHEMA.READ, isAuth, getHousehold);
    route.put('/:household_id', HOUSEHOLD_SCHEMA.UPDATE, isAuth, updateHousehold);
    route.delete('/', HOUSEHOLD_SCHEMA.DELETE, isAuth, deleteHousehold);
    route.patch('/:household_id', HOUSEHOLD_SCHEMA.PATCH, isAuth, updateActiveInactive);
};

async function createHousehold(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IHouseholds.createHousehold(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getHousehold(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IHouseholds.getHousehold(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateHousehold(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['household_id'] = req.params.household_id;
    IHouseholds.updateHousehold(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteHousehold(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IHouseholds.deleteHousehold(data, url)
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
    data['household_id'] = req.params.household_id;
    IHouseholds.updateActiveInactive(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}