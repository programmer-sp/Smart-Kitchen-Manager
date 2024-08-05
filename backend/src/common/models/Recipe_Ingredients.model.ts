import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Recipe_IngredientsAttributes {
    recipe_ingredient_id: string;
    recipe_id: string;
    ingredient_id: string;
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
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        recipe_id: {
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
    }, {
        timestamps: true
    });
};