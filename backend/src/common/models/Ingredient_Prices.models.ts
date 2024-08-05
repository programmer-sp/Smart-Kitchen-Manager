import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Ingredient_PricesAttributes {
    price_id: string;
    ingredient_id: string;
    store_id: string;
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
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        ingredient_id: {
            type: DataTypes.STRING,
        },
        store_id: {
            type: DataTypes.STRING,
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