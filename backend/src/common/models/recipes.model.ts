import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Recipes_Attributes {
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

export interface Recipes_Model extends Model<Recipes_Attributes>, Recipes_Attributes { };

export type Recipes_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Recipes_Model;
};

export function Recipes_Factory(sequelize: Sequelize): Recipes_Static {
    return <Recipes_Static>sequelize.define('Recipes', {
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
            type: DataTypes.INTEGER,
        },
        system_rating: {
            type: DataTypes.INTEGER,
        },
        expiration_date: {
            type: DataTypes.DATE
        },
        is_rated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        timestamps: true
    });
};