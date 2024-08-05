import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Ingredient_CategoriesAttributes {
    category_id: string;
    category_name: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Ingredient_CategoriesModel extends Model<Ingredient_CategoriesAttributes>, Ingredient_CategoriesAttributes { };

export type Ingredient_CategoriesStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): Ingredient_CategoriesModel;
};

export function Ingredient_CategoriesFactory(sequelize: Sequelize): Ingredient_CategoriesStatic {
    return <Ingredient_CategoriesStatic>sequelize.define('Ingredient_Categories', {
        category_id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        category_name: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true
    });
};