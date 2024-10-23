import ms from 'ms';
import * as l10n from 'jm-ez-l10n';
import config from '../../common/config';
import { Container } from 'typedi';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { Users } from '../../common/models/index';
import userPreferencesModel from '../../common/models/User_Preferences.model';
import { MODULE_NAME, RESPONSE_METHOD, REDIS_KEYS } from '../../common/utils/Constants';
import { redis } from '../../common/services/redis';

export class IUsers {
    static async updatePreference(data: any, url: string) {
        try {
            const tokenData: any = Container.get('auth-token');
            let dietary_restrictions = data.dietary_restrictions.split(',');
            let preferred_cuisines = data.preferred_cuisines.split(',');

            const preferenceData = await userPreferencesModel.findOne({ user_id: tokenData.user_id });
            if (!preferenceData) await userPreferencesModel.create({ user_id: tokenData.user_id, dietary_restrictions, preferred_cuisines });
            else if (JSON.stringify(preferenceData.dietary_restrictions) != JSON.stringify(dietary_restrictions) || JSON.stringify(preferenceData.preferred_cuisines) != JSON.stringify(preferred_cuisines)) await userPreferencesModel.updateOne({ user_id: tokenData.user_id }, { dietary_restrictions, preferred_cuisines });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.USER, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updatePreference" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}