import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

export interface StoresAttributes {
    store_id: string;
    store_name: string;
    address: string;
    status: boolean;
    rating: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface StoresModel extends Model<StoresAttributes>, StoresAttributes { };

export type StoresStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): StoresModel;
};

export function StoresFactory(sequelize: Sequelize): StoresStatic {
    return <StoresStatic>sequelize.define('Stores', {
        store_id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        store_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        rating: {
            type: DataTypes.NUMBER,
            defaultValue: 0
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