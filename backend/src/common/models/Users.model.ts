import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";
import config from '../config';
import { aesEncryption, aesDcryption } from '../utils/Encryption';
import bcrypt from 'bcryptjs';

export const setEncrypt = (value: any) => {
    return value && value !== '' ? aesEncryption(value, config.ENC_KEY).toString() : '';
};

export const getDecrypt = (value: any) => {
    return value && value !== '' ? aesDcryption(value, config.ENC_KEY).toString() : '';
};

export interface Users_Attributes {
    user_id: number;
    username: string;
    email: string;
    role: string;
    status: boolean;
    email_verified: Boolean;
    invitation_token: string;
    password_hash: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface Users_Model extends Model<Users_Attributes>, Users_Attributes { };

export type Users_Static = typeof Model & {
    new(values?: object, options?: BuildOptions): Users_Model;
};

export function Users_Factory(sequelize: Sequelize): Users_Static {
    const User = <Users_Static>sequelize.define('Users', {
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
            type: DataTypes.ENUM('guest', 'member', 'owner', 'moderator', 'administrator', 'content creator', 'viewer'),
            defaultValue: 'viewer',
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        invitation_token: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
    }, {
        timestamps: true
    });

    User.addHook('beforeCreate', async (user: any, options) => {
        const saltRounds = 10;
        let salt = await bcrypt.genSaltSync(saltRounds);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    });

    return User;
};