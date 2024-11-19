import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Ingredients_Attributes {
    ingredient_id: number;
    name: string;
    category_id: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Ingredients_Model extends Model<Ingredients_Attributes>, Ingredients_Attributes { };

export type Ingredients_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Ingredients_Model;
};

export function Ingredients_Factory(sequelize: Sequelize): Ingredients_Static {
    return <Ingredients_Static>sequelize.define('Ingredients', {
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