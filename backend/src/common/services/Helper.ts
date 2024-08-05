import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function verifyPassword(reqPassword: string, password: string) {
    return await bcrypt.compare(reqPassword, password);
};

export function genHashToken(token_length = 10) {
    let buffer = crypto.randomBytes(token_length);
    const token = buffer.toString('hex');
    return token;
};

export async function isJson(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

export async function InvoiceNumber(min = 0, max = 500000) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const num = (Math.floor(Math.random() * (max - min + 1)) + min) + (+new Date());
    let strNum = num.toString();
    strNum = strNum.slice(3, strNum.length);
    return strNum.padStart(6, "0");
}