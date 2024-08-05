import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Household_IngredientsAttributes {
    household_ingredient_id: string;
    household_id: string;
    ingredient_id: string;
    quantity: number;
    unit: string;
    expiration_date: Date;
    is_expired: string;
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
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        household_id: {
            type: DataTypes.STRING,
        },
        ingredient_id: {
            type: DataTypes.STRING,
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