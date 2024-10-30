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

    route.post('/', isAuth, HOUSEHOLD_SCHEMA.CREATE, createHousehold);
    route.get('/', isAuth, HOUSEHOLD_SCHEMA.READ, getHousehold);
    route.put('/:household_id', isAuth, HOUSEHOLD_SCHEMA.UPDATE, updateHousehold);
    route.delete('/', isAuth, HOUSEHOLD_SCHEMA.DELETE, deleteHousehold);
    route.patch('/:household_id', isAuth, HOUSEHOLD_SCHEMA.PATCH, updateActiveInactive);

    // Household User's api's
    route.post('/user', isAuth, HOUSEHOLD_SCHEMA.ADD_USER, addHouseholdUser);
    route.get('/user', isAuth, HOUSEHOLD_SCHEMA.READ_USER, getHouseholdUser);
    route.put('/user/:household_user_id', isAuth, HOUSEHOLD_SCHEMA.UPDATE_USER, updateHouseholdUser);
    route.delete('/user', isAuth, HOUSEHOLD_SCHEMA.DELETE_USER, deleteHouseholdUser);
    route.patch('/user/:household_id', isAuth, HOUSEHOLD_SCHEMA.PATCH_USER, activeInactiveHouseholdUser);

    // Household Ingredient api's
    route.post('/ingredient', isAuth, HOUSEHOLD_SCHEMA.ADD_INGREDIENT, addHouseholdIngd);
    route.get('/ingredient', isAuth, HOUSEHOLD_SCHEMA.READ_INGREDIENT, getHouseholdIngd);
    route.put('/ingredient/:household_ingredient_id', isAuth, HOUSEHOLD_SCHEMA.UPDATE_INGREDIENT, updateHouseholdIngd);
    route.delete('/ingredient', isAuth, HOUSEHOLD_SCHEMA.DELETE_INGREDIENT, deleteHouseholdIngd);
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

async function activeInactiveHouseholdUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['household_user_id'] = req.params.household_user_id;
    IHouseholds.activeInactiveHouseholdUser(data, url)
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