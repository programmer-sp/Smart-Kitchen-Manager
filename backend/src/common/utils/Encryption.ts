import * as crypto from 'crypto-js';
import config from '../config';
import _crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function encryptStringWithRsaPublicKey(toEncrypt, PublicKey) {
  var buffer = Buffer.from(toEncrypt);
  var encrypted = _crypto.publicEncrypt(PublicKey, buffer);
  return encrypted.toString("base64");
}

export function decryptStringWithRsaPrivateKey(toDecrypt, PrivateKey) {
  var buffer = Buffer.from(toDecrypt, "base64");
  var decrypted = _crypto.privateDecrypt(PrivateKey, buffer);
  return decrypted.toString("utf8");
}

export function hash(password) {
  return crypto.SHA512(password).toString().toUpperCase();
}

export async function encryptPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export function aesEncryption(text: string, key: string) {
  let cipher = _crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(config.ENC_IV, 'hex'));
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('hex');
}

export function aesDcryption(text: string, key: string) {
  let encryptedText = Buffer.from(text, 'hex');
  let decipher = _crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(config.ENC_IV, 'hex'));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}