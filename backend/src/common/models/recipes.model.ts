import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface RecipesAttributes {
    recipe_id: number;
    recipe_name: string;
    cuisine: string;
    preparation_time: number;
    system_rating: number;
    is_rated: Boolean;
    expiration_date: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface RecipesModel extends Model<RecipesAttributes>, RecipesAttributes { };

export type RecipesStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): RecipesModel;
};

export function RecipesFactory(sequelize: Sequelize): RecipesStatic {
    return <RecipesStatic>sequelize.define('Recipes', {
        recipe_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        recipe_name: {
            type: DataTypes.STRING,
        },
        cuisine: {
            type: DataTypes.STRING,
        },
        preparation_time: {
            type: DataTypes.NUMBER,
        },
        system_rating: {
            type: DataTypes.NUMBER,
        },
        expiration_date: {
            type: DataTypes.DATE
        },
        is_rated: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: true
    });
};