import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface User_Ratings_Attributes {
    rating_id: number;
    user_id: number;
    recipe_id: number;
    rating: number;
    review: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface User_Ratings_Model extends Model<User_Ratings_Attributes>, User_Ratings_Attributes { };

export type User_Ratings_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): User_Ratings_Model;
};

export function User_Ratings_Factory(sequelize: Sequelize): User_Ratings_Static {
    return <User_Ratings_Static>sequelize.define('User_Rating', {
        rating_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            },
        },
        recipe_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Recipes',
                key: 'recipe_id'
            },
        },
        rating: {
            type: DataTypes.INTEGER,
        },
        review: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true
    });
};