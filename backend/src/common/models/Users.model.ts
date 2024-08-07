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
    user_id: number;
    username: string;
    email: string;
    role: string;
    status: boolean;
    emailVerified: Boolean;
    invitationToken: string;
    password_hash: string;
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
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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
            allowNull: false,
            unique: true
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
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.ENUM('Guest', 'Member', 'Owner', 'Moderator', 'Administrator', 'Content Creator', 'Viewer'),
            defaultValue: 'Member',
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        password_hash: {
            type: DataTypes.STRING,
            set(value) {
                let setValue: any = setPassword(value);
                this.setDataValue('password_hash', setValue);
            },
            allowNull: false,
        },
        invitationToken: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
    }, {
        timestamps: true
    });
};