import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface Stores_Attributes {
    store_id: number;
    store_name: string;
    address: string;
    status: boolean;
    rating: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Stores_Model extends Model<Stores_Attributes>, Stores_Attributes { };

export type Stores_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Stores_Model;
};

export function Stores_Factory(sequelize: Sequelize): Stores_Static {
    return <Stores_Static>sequelize.define('Stores', {
        store_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        store_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: true
    });
};