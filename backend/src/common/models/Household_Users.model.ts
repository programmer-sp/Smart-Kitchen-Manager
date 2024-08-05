import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Household_UsersAttributes {
    household_user_id: string;
    household_id: string;
    user_id: string;
    household_name: string;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Household_UsersModel extends Model<Household_UsersAttributes>, Household_UsersAttributes { };

export type Household_UsersStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): Household_UsersModel;
};

export function Household_UsersFactory(sequelize: Sequelize): Household_UsersStatic {
    return <Household_UsersStatic>sequelize.define('Household_Users', {
        household_user_id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        household_id: {
            type: DataTypes.STRING,
        },
        user_id: {
            type: DataTypes.STRING,
        },
        household_name: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        timestamps: true
    });
};