import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Household_UsersAttributes {
    household_user_id: number;
    household_id: number;
    user_id: number;
    role: string;
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
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        household_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Households',
                key: 'household_id'
            },
            allowNull: false
        },
        user_id: {
            type: DataTypes.STRING,
            references: {
                model: 'Users',
                key: 'user_id'
            },
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('Guest', 'Member', 'Owner', 'Moderator', 'Administrator', 'Content Creator', 'Viewer'),
            defaultValue: 'Member',
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        timestamps: true
    });
};