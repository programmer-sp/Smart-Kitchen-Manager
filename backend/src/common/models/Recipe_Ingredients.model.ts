import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Recipe_IngredientsAttributes {
    recipe_ingredient_id: number;
    recipe_id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Recipe_IngredientsModel extends Model<Recipe_IngredientsAttributes>, Recipe_IngredientsAttributes { };

export type Recipe_IngredientsStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): Recipe_IngredientsModel;
};

export function Recipe_IngredientsFactory(sequelize: Sequelize): Recipe_IngredientsStatic {
    return <Recipe_IngredientsStatic>sequelize.define('Recipe_Ingredients', {
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
            type: DataTypes.NUMBER,
        },
        unit: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true
    });
};