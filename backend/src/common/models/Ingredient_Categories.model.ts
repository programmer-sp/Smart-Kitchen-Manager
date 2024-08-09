import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Ingredient_Categories_Attributes {
    category_id: number;
    category_name: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Ingredient_Categories_Model extends Model<Ingredient_Categories_Attributes>, Ingredient_Categories_Attributes { };

export type Ingredient_Categories_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Ingredient_Categories_Model;
};

export function Ingredient_Categories_Factory(sequelize: Sequelize): Ingredient_Categories_Static {
    return <Ingredient_Categories_Static>sequelize.define('Ingredient_Categories', {
        category_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        category_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
    }, {
        timestamps: true
    });
};