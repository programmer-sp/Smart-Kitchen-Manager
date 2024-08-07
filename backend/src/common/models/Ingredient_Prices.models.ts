import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Ingredient_PricesAttributes {
    price_id: number;
    ingredient_id: number;
    store_id: number;
    price: number;
    unit: string;
    last_updated: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Ingredient_PricesModel extends Model<Ingredient_PricesAttributes>, Ingredient_PricesAttributes { };

export type Ingredient_PricesStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): Ingredient_PricesModel;
};

export function Ingredient_PricesFactory(sequelize: Sequelize): Ingredient_PricesStatic {
    return <Ingredient_PricesStatic>sequelize.define('Ingredient_Prices', {
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
            type: DataTypes.NUMBER,
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