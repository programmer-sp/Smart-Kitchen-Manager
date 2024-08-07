import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface User_Recipe_HistoryAttributes {
    history_id: number;
    user_id: number;
    recipe_id: number;
    cooked_at: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface User_Recipe_HistoryModel extends Model<User_Recipe_HistoryAttributes>, User_Recipe_HistoryAttributes { };

export type User_Recipe_HistoryStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): User_Recipe_HistoryModel;
};

export function User_Recipe_HistoryFactory(sequelize: Sequelize): User_Recipe_HistoryStatic {
    return <User_Recipe_HistoryStatic>sequelize.define('User_Recipe_History', {
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