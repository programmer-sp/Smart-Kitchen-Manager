import { Router, Request, Response } from 'express';
import * as l10n from 'jm-ez-l10n';
import status_code from '../../common/utils/statusCode';
import logger from '../../common/loaders/logger';
import { isAuth } from '../middlewares/authorization';
import { ICategory } from '../Interfaces/ICategory';
import { CATEGORY_SCHEMA } from '../schema/category';

const route = Router();
const commonAuth = (req: Request, res: Response, next: any) => { Object.assign(req.headers, { authType: "common" }); next(); };
const adminAuth = (req: Request, res: Response, next: any) => { Object.assign(req.headers, { authType: "admin" }); next(); };

export default (app: Router) => {
    app.use('/category', route);

    route.post('/', CATEGORY_SCHEMA.CREATE, adminAuth, isAuth, addCategory);
    route.get('/', CATEGORY_SCHEMA.READ, commonAuth, isAuth, getCategory);
    route.put('/:category_id', CATEGORY_SCHEMA.UPDATE, adminAuth, isAuth, updateCategory);
    route.delete('/', CATEGORY_SCHEMA.DELETE, adminAuth, isAuth, deleteCategory);
};

async function addCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.body;
    ICategory.addCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function getCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    ICategory.getCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function updateCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    let data = req.body;
    data['category_id'] = req.params.category_id;
    ICategory.updateCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}

async function deleteCategory(req: any, res: Response) {
    const url = req.protocol + '://' + req.hostname + req.originalUrl;
    const data = req.query;
    ICategory.deleteCategory(data, url)
        .then(response => {
            res.status(response.status).json(response);
        })
        .catch(e => {
            logger.errorAndMail({ e });
            res.status(status_code.INTERNAL_SERVER_ERROR).json({ status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') });
        });
}