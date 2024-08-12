import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { isAuth } from '../middlewares/authorization';
import { IRecipe } from '../Interfaces/IRecipes';
import { RECIPE_SCHEMA } from '../schema/recipe';

const route = Router();

export default (app: Router) => {
    app.use('/recipe', route);

    route.post('/', RECIPE_SCHEMA.CREATE, isAuth, addRecipe);
    route.get('/', RECIPE_SCHEMA.READ, isAuth, getRecipe);
    route.put('/:recipe_id', RECIPE_SCHEMA.UPDATE, isAuth, updateRecipe);
    route.delete('/', RECIPE_SCHEMA.DELETE, isAuth, deleteRecipe);
};

async function addRecipe(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    IRecipe.addRecipe(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getRecipe(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IRecipe.getRecipe(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateRecipe(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['recipe_id'] = req.params.recipe_id;
    IRecipe.updateRecipe(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteRecipe(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    IRecipe.deleteRecipe(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}