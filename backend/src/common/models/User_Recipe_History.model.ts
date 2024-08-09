import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface User_Recipe_History_Attributes {
    history_id: number;
    user_id: number;
    recipe_id: number;
    cooked_at: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface User_Recipe_History_Model extends Model<User_Recipe_History_Attributes>, User_Recipe_History_Attributes { };

export type User_Recipe_History_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): User_Recipe_History_Model;
};

export function User_Recipe_History_Factory(sequelize: Sequelize): User_Recipe_History_Static {
    return <User_Recipe_History_Static>sequelize.define('User_Recipe_History', {
        history_id: {
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
        cooked_at: {
            type: DataTypes.DATE,
        },
    }, {
        timestamps: true
    });
};