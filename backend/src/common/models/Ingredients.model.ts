import { BuildOptions, DataTypes, DATE, Model, Sequelize } from "sequelize";
import config from '../config';

export interface IngredientsAttributes {
    ingredient_id: number;
    name: string;
    category_id: number;
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
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
        },
        category_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Ingredient_Categories',
                key: 'category_id'
            },
        },
    }, {
        timestamps: true
    });
};