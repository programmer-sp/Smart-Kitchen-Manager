import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Household_IngredientsAttributes {
    household_ingredient_id: number;
    household_id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    expiration_date: Date;
    is_expired: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Household_IngredientsModel extends Model<Household_IngredientsAttributes>, Household_IngredientsAttributes { };

export type Household_IngredientsStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): Household_IngredientsModel;
};

export function Household_IngredientsFactory(sequelize: Sequelize): Household_IngredientsStatic {
    return <Household_IngredientsStatic>sequelize.define('Household_Ingredients', {
        household_ingredient_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        household_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Households',
                key: 'household_id'
            },
        },
        ingredient_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Ingredients',
                key: 'ingredient_id'
            },
        },
        quantity: {
            type: DataTypes.NUMBER,
        },
        unit: {
            type: DataTypes.STRING,
        },
        expiration_date: {
            type: DataTypes.DATE
        },
        is_expired: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: true
    });
};