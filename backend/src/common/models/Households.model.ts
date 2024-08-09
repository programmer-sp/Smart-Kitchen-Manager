import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Households_Attributes {
    household_id: number;
    household_name: string;
    status: boolean;
    address: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Households_Model extends Model<Households_Attributes>, Households_Attributes { };

export type Households_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Households_Model;
};

export function Households_Factory(sequelize: Sequelize): Households_Static {
    return <Households_Static>sequelize.define('Households', {
        household_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        household_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true
    });
};