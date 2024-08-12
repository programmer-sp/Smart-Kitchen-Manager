import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Household_Ingredients_Attributes {
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

export interface Household_Ingredients_Model extends Model<Household_Ingredients_Attributes>, Household_Ingredients_Attributes { };

export type Household_Ingredients_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Household_Ingredients_Model;
};

export function Household_Ingredients_Factory(sequelize: Sequelize): Household_Ingredients_Static {
    return <Household_Ingredients_Static>sequelize.define('Household_Ingredients', {
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
            type: DataTypes.INTEGER,
        },
        unit: {
            type: DataTypes.STRING,
        },
        expiration_date: {
            type: DataTypes.DATE
        },
        is_expired: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    });
};