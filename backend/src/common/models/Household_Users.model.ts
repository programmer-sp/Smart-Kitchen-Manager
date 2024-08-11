import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Household_Users_Attributes {
    household_user_id: number;
    household_id: number;
    user_id: number;
    role: string;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Household_Users_Model extends Model<Household_Users_Attributes>, Household_Users_Attributes { };

export type Household_Users_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Household_Users_Model;
};

export function Household_Users_Factory(sequelize: Sequelize): Household_Users_Static {
    return <Household_Users_Static>sequelize.define('Household_Users', {
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
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            },
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('guest', 'member', 'owner', 'moderator', 'administrator', 'content creator', 'viewer'),
            defaultValue: 'member',
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        timestamps: true
    });
};