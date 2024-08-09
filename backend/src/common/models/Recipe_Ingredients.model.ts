import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Recipe_Ingredients_Attributes {
    recipe_ingredient_id: number;
    recipe_id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Recipe_Ingredients_Model extends Model<Recipe_Ingredients_Attributes>, Recipe_Ingredients_Attributes { };

export type Recipe_Ingredients_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Recipe_Ingredients_Model;
};

export function Recipe_Ingredients_Factory(sequelize: Sequelize): Recipe_Ingredients_Static {
    return <Recipe_Ingredients_Static>sequelize.define('Recipe_Ingredients', {
        recipe_ingredient_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        recipe_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Recipes',
                key: 'recipe_id'
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
    }, {
        timestamps: true
    });
};