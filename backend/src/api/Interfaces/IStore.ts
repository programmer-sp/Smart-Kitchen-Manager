import * as l10n from 'jm-ez-l10n';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { MODULE_NAME, RESPONSE_METHOD } from '../../common/utils/Constants';
import { Stores } from '../../common/models/index';
import { Op } from 'sequelize';

export class IStore {
    static async getStore(data: any, url: string) {
        try {
            if (data.store_id) {
                const storeData = await Stores.findOne({ where: { store_id: data.store_id } });
                if (!storeData) return { status: status_code.NOTFOUND, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.STORE }) };

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.READ }), data: storeData };
            } else {
                const page = +data.page || 1;
                const limit = +data.limit || 10;
                const search = data.search;
                const condition: any = {
                    offset: (page - 1) * limit,
                    limit: limit,
                    order: [['createdAt', 'DESC']],
                };

                let storeData: any = [];
                if (search) condition['where'] = { store_name: { [Op.iLike]: `%${search}%` } };
                storeData = await Stores.findAndCountAll(condition);

                return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.STORE, method: RESPONSE_METHOD.READ }), count: storeData.count, data: storeData.rows };
            }
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getStore" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}