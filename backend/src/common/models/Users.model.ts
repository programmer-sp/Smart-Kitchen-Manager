import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";
import config from '../config';
import { aesEncryption, aesDcryption, encryptPassword } from '../utils/Encryption';

export const setEncrypt = (value: any) => {
    return value && value !== '' ? aesEncryption(value, config.ENC_KEY).toString() : '';
};

export const getDecrypt = (value: any) => {
    return value && value !== '' ? aesDcryption(value, config.ENC_KEY).toString() : '';
};

export const setPassword = (value: any) => {
    return value && value !== '' ? encryptPassword(value).toString() : '';
};

export interface UsersAttributes {
    user_id: string;
    username: string;
    email: string;
    status: boolean;
    type: string;
    emailVerified: Boolean;
    password: string;
    invitationToken: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface UsersModel extends Model<UsersAttributes>, UsersAttributes { };

export type UsersStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): UsersModel;
};

export function UsersFactory(sequelize: Sequelize): UsersStatic {
    return <UsersStatic>sequelize.define('Users', {
        user_id: {
            type: DataTypes.UUID,
            autoIncrement: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        username: {
            type: DataTypes.STRING,
            set(value) {
                let setValue: any = setEncrypt(value);
                this.setDataValue('username', setValue);
            },
            get() {
                let getValue = getDecrypt(this.getDataValue('username'))
                return getValue;
            },
        },
        email: {
            type: DataTypes.STRING,
            set(value) {
                let setValue: any = setEncrypt(value);
                this.setDataValue('email', setValue);
            },
            get() {
                let getValue = getDecrypt(this.getDataValue('email'))
                return getValue;
            },
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        type: {
            type: DataTypes.ENUM('Guest', 'Member', 'Owner', 'Moderator', 'Administrator'),
            defaultValue: 'Member',
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        password: {
            type: DataTypes.STRING,
            set(value) {
                let setValue: any = setPassword(value);
                this.setDataValue('password', setValue);
            },
            allowNull: true,
        },
        invitationToken: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true
    });
};