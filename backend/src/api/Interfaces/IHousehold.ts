import * as l10n from 'jm-ez-l10n';
import logger from '../../common/loaders/logger';
import status_code from '../../common/utils/statusCode';
import { Households } from '../../common/models/index';
import { MODULE_NAME, RESPONSE_METHOD } from '../../common/utils/Constants';
import { Op } from 'sequelize';

export class IHouseholds {
    static async createHousehold(data: any, url: string) {
        try {
            const isExists = await Households.findOne({ where: { household_name: data.household_name, status: true } });
            if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: data.household_name }) };

            await Households.create({ household_name: data.household_name, address: data.address });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.CREATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "createHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async getHousehold(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.READ }), data: householdData };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "getHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateHousehold(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            let updateObj = {};
            if (data.address) updateObj['address'] = data.address;
            if (data.household_name) {
                const isExists = await Households.findOne({ where: { household_id: { [Op.ne]: data.household_id }, household_name: data.household_name, status: true } });
                if (isExists) return { status: status_code.ALREADY_EXIST, message: l10n.t('ALREADY_EXISTS', { key: data.household_name }) };
                else updateObj['household_name'] = data.household_name;
            }
            await Households.update(updateObj, { where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.UPDATE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async deleteHousehold(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };

            await Households.destroy({ where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: RESPONSE_METHOD.DELETE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "deleteHousehold" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }

    static async updateActiveInactive(data: any, url: string) {
        try {
            const householdData = await Households.findOne({ where: { household_id: data.household_id } });
            if (!householdData) return { status: status_code.BAD_REQUEST, message: l10n.t('NOT_FOUND', { key: MODULE_NAME.HOUSEHOLD }) };
            else if (householdData.status === data.active) return { status: status_code.BAD_REQUEST, message: l10n.t('COMMON_ALREADY', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };

            await Households.update({ status: data.active }, { where: { household_id: data.household_id } });

            return { status: status_code.OK, message: l10n.t('COMMON_SUCCESS', { key: MODULE_NAME.HOUSEHOLD, method: data.active ? RESPONSE_METHOD.ACTIVE : RESPONSE_METHOD.INACTIVE }) };
        } catch (error) {
            logger.errorAndMail({ e: error, routeName: url, functionName: "updateActiveInactive" });
            return { status: status_code.INTERNAL_SERVER_ERROR, message: l10n.t('SOMETHING_WENT_WRONG') };
        }
    }
}