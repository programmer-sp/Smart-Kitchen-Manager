import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Ingredient_Prices_Attributes {
    price_id: number;
    ingredient_id: number;
    store_id: number;
    price: number;
    unit: string;
    last_updated: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Ingredient_Prices_Model extends Model<Ingredient_Prices_Attributes>, Ingredient_Prices_Attributes { };

export type Ingredient_Prices_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Ingredient_Prices_Model;
};

export function Ingredient_Prices_Factory(sequelize: Sequelize): Ingredient_Prices_Static {
    return <Ingredient_Prices_Static>sequelize.define('Ingredient_Prices', {
        price_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ingredient_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Ingredients',
                key: 'ingredient_id'
            },
        },
        store_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Stores',
                key: 'store_id'
            },
        },
        price: {
            type: DataTypes.INTEGER,
        },
        unit: {
            type: DataTypes.STRING,
        },
        last_updated: {
            type: DataTypes.DATE
        }
    }, {
        timestamps: true
    });
};