import { BuildOptions, DataTypes, DATE, Model, Sequelize } from "sequelize";
import config from '../config';

export interface IngredientsAttributes {
    ingredient_id: string;
    name: string;
    category_id: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface IngredientsModel extends Model<IngredientsAttributes>, IngredientsAttributes { };

export type IngredientsStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): IngredientsModel;
};

export const getImageUrlOfBucket = (value: any) => {
    return value && value !== '' ? `${config.ASSETS_URL}${value}` : '';
};

export function IngredientsFactory(sequelize: Sequelize): IngredientsStatic {
    return <IngredientsStatic>sequelize.define('Ingredients', {
        ingredient_id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
        },
        category_id: {
            type: DataTypes.STRING
        },
    }, {
        timestamps: true
    });
};