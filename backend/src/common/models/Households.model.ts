import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface HouseholdsAttributes {
    household_id: number;
    household_name: string;
    status: boolean;
    address: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface HouseholdsModel extends Model<HouseholdsAttributes>, HouseholdsAttributes { };

export type HouseholdsStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): HouseholdsModel;
};

export function HouseholdsFactory(sequelize: Sequelize): HouseholdsStatic {
    return <HouseholdsStatic>sequelize.define('Households', {
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