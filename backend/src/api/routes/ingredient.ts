import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { isAuth } from '../middlewares/authorization';
import { IIngredient } from '../Interfaces/IIngredient';
import { INGREDIENT_SCHEMA } from '../schema/ingredient';

const route = Router();

export default (app: Router) => {
    app.use('/ingredient', route);

    route.post('/', INGREDIENT_SCHEMA.CREATE, isAuth, addIngredient);
    route.get('/', INGREDIENT_SCHEMA.READ, isAuth, getIngredient);
    route.put('/:ingredient_id', INGREDIENT_SCHEMA.UPDATE, isAuth, updateIngredient);
    route.delete('/', INGREDIENT_SCHEMA.DELETE, isAuth, deleteIngredient);
};

async function addIngredient(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IIngredient.addIngredient(data, url)
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
    IIngredient.getIngredient(data, url)
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
    IIngredient.updateIngredient(data, url)
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
    IIngredient.deleteIngredient(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}