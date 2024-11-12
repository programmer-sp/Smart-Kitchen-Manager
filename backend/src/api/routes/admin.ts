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
const adminAuth = (req: Request, res: Response, next: any) => { Object.assign(req.headers, { authType: "admin" }); next(); };

export default (app: Router) => {
    app.use('/admin', route);

    /* ---------------------- User API's ---------------------- */
    route.get('/get-user', adminAuth, isAuth, ADMIN_SCHEMA.READ_USER, getUser);
    route.patch('/update-user/:user_id', adminAuth, isAuth, ADMIN_SCHEMA.PATCH_USER, activeInactiveUser);

    /* ---------------------- Store API's ---------------------- */
    route.post('/add-store', adminAuth, isAuth, ADMIN_SCHEMA.ADD_STORE, addStore);
    route.get('/get-store', adminAuth, isAuth, ADMIN_SCHEMA.READ_STORE, getStore);
    route.put('/update-store/:store_id', adminAuth, isAuth, ADMIN_SCHEMA.UPDATE_STORE, updateStore);
    route.delete('/delete-store', adminAuth, isAuth, ADMIN_SCHEMA.DELETE_STORE, deleteStore);

    /* ---------------------- Household API's ---------------------- */
    route.post('/add-household', adminAuth, isAuth, ADMIN_SCHEMA.ADD_HOUSEHOLD, addHousehold);
    route.get('/get-household', adminAuth, isAuth, ADMIN_SCHEMA.READ_HOUSEHOLD, getHousehold);
    route.put('/update-household/:household_id', adminAuth, isAuth, ADMIN_SCHEMA.UPDATE_HOUSEHOLD, updateHousehold);
    route.delete('/delete-household', adminAuth, isAuth, ADMIN_SCHEMA.DELETE_HOUSEHOLD, deleteHousehold);
    route.patch('/household-status/:household_id', adminAuth, isAuth, ADMIN_SCHEMA.PATCH_HOUSEHOLD, activeInactiveHousehold);

    /* ---------------------- Household User API's ---------------------- */
    route.post('/add-household-user', adminAuth, isAuth, ADMIN_SCHEMA.ADD_HOUSEHOLD_USER, addHouseholdUser);
    route.get('/get-household-user', adminAuth, isAuth, ADMIN_SCHEMA.READ_HOUSEHOLD_USER, getHouseholdUser);
    route.put('/update-household-user/:household_user_id', adminAuth, isAuth, ADMIN_SCHEMA.UPDATE_HOUSEHOLD_USER, updateHouseholdUser);
    route.delete('/delete-household-user', adminAuth, isAuth, ADMIN_SCHEMA.DELETE_HOUSEHOLD_USER, deleteHouseholdUser);
    route.patch('/household-user-status/:household_user_id', adminAuth, isAuth, ADMIN_SCHEMA.PATCH_HOUSEHOLD_USER, activeInactiveHouseholdUser);

    /* ---------------------- Ingredient Category API's ---------------------- */
    route.post('/add-ingd-category', adminAuth, isAuth, ADMIN_SCHEMA.ADD_INGD_CATEGORY, addIngdCategory);
    route.get('/get-ingd-category', adminAuth, isAuth, ADMIN_SCHEMA.READ_INGD_CATEGORY, getIngdCategory);
    route.put('/update-ingd-category/:category_id', adminAuth, isAuth, ADMIN_SCHEMA.UPDATE_INGD_CATEGORY, updateIngdCategory);
    route.delete('/delete-ingd-category', adminAuth, isAuth, ADMIN_SCHEMA.DELETE_INGD_CATEGORY, deleteIngdCategory);

    /* ---------------------- Ingredient Price API's ---------------------- */
    route.post('/add-ingd-price', adminAuth, isAuth, ADMIN_SCHEMA.ADD_INGD_PRICE, addIngredientPrice);
    route.get('/get-ingd-price', adminAuth, isAuth, ADMIN_SCHEMA.READ_INGD_PRICE, getIngredientPrice);
    route.put('/update-ingd-price/:price_id', adminAuth, isAuth, ADMIN_SCHEMA.UPDATE_INGD_PRICE, updateIngredientPrice);
    route.delete('/delete-ingd-price', adminAuth, isAuth, ADMIN_SCHEMA.DELETE_INGD_PRICE, deleteIngredientPrice);

    /* ---------------------- Ingredient API's ---------------------- */
    route.post('/add-ingd', adminAuth, isAuth, ADMIN_SCHEMA.ADD_INGD, addIngredient);
    route.get('/get-ingd', adminAuth, isAuth, ADMIN_SCHEMA.READ_INGD, getIngredient);
    route.put('/update-ingd/:ingredient_id', adminAuth, isAuth, ADMIN_SCHEMA.UPDATE_INGD, updateIngredient);
    route.delete('/delete-ingd', adminAuth, isAuth, ADMIN_SCHEMA.DELETE_INGD, deleteIngredient);

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

async function activeInactiveUser(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['user_id'] = req.params.user_id;
    IAdmin.activeInactiveUser(data, url)
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

async function addHousehold(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAdmin.addHousehold(data, url)
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
    IAdmin.getHousehold(data, url)
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
    IAdmin.updateHousehold(data, url)
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
    IAdmin.deleteHousehold(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function activeInactiveHousehold(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['household_id'] = req.params.household_id;
    IAdmin.activeInactiveHousehold(data, url)
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
    IAdmin.addHouseholdUser(data, url)
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
    IAdmin.getHouseholdUser(data, url)
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
    IAdmin.updateHouseholdUser(data, url)
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
    IAdmin.deleteHouseholdUser(data, url)
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
    IAdmin.activeInactiveHouseholdUser(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function addIngdCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAdmin.addIngdCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getIngdCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.getIngdCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateIngdCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['category_id'] = req.params.category_id;
    IAdmin.updateIngdCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteIngdCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.deleteIngdCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function addIngredientPrice(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAdmin.addIngredientPrice(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getIngredientPrice(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.getIngredientPrice(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateIngredientPrice(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['price_id'] = req.params.price_id;
    IAdmin.updateIngredientPrice(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteIngredientPrice(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.deleteIngredientPrice(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function addIngredient(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IAdmin.addIngredient(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getIngredient(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.getIngredient(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateIngredient(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['ingredient_id'] = req.params.ingredient_id;
    IAdmin.updateIngredient(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteIngredient(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IAdmin.deleteIngredient(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}