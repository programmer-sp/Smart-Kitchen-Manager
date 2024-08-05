import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface User_Recipe_HistoryAttributes {
    rating_id: string;
    user_id: string;
    recipe_id: string;
    rating : number;
    review: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface User_Recipe_HistoryModel extends Model<User_Recipe_HistoryAttributes>, User_Recipe_HistoryAttributes { };

export type User_Recipe_HistoryStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): User_Recipe_HistoryModel;
};

export function User_Recipe_HistoryFactory(sequelize: Sequelize): User_Recipe_HistoryStatic {
    return <User_Recipe_HistoryStatic>sequelize.define('User_Recipe_History', {
        rating_id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        user_id: {
            type: DataTypes.STRING,
        },
        recipe_id: {
            type: DataTypes.STRING,
        },
        rating: {
            type: DataTypes.NUMBER,
        },
        review: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true
    });
};