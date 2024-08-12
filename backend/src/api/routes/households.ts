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

    // Household User's api's
    route.post('/user', HOUSEHOLD_SCHEMA.ADD_USER, isAuth, addHouseholdUser);
    route.get('/user', HOUSEHOLD_SCHEMA.READ_USER, isAuth, getHouseholdUser);
    route.put('/user/:household_user_id', HOUSEHOLD_SCHEMA.UPDATE_USER, isAuth, updateHouseholdUser);
    route.delete('/user', HOUSEHOLD_SCHEMA.DELETE_USER, isAuth, deleteHouseholdUser);

    // Household Ingredient api's
    route.post('/ingredient', HOUSEHOLD_SCHEMA.ADD_INGREDIENT, isAuth, addHouseholdIngd);
    route.get('/ingredient', HOUSEHOLD_SCHEMA.READ_INGREDIENT, isAuth, getHouseholdIngd);
    route.put('/ingredient/:household_ingredient_id', HOUSEHOLD_SCHEMA.UPDATE_INGREDIENT, isAuth, updateHouseholdIngd);
    route.delete('/ingredient', HOUSEHOLD_SCHEMA.DELETE_INGREDIENT, isAuth, deleteHouseholdIngd);
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

async function addHouseholdUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IHouseholds.addHouseholdUser(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getHouseholdUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IHouseholds.getHouseholdUser(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateHouseholdUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['household_user_id'] = req.params.household_user_id;
    IHouseholds.updateHouseholdUser(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteHouseholdUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IHouseholds.deleteHouseholdUser(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function addHouseholdIngd(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IHouseholds.addHouseholdIngd(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getHouseholdIngd(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IHouseholds.getHouseholdIngd(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateHouseholdIngd(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['household_ingredient_id'] = req.params.household_ingredient_id;
    IHouseholds.updateHouseholdIngd(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteHouseholdIngd(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IHouseholds.deleteHouseholdIngd(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}