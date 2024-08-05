import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto-js';
import config from '../config'

// Generate activation hash
export function generateJWTToken(data, ciphertext_key?, jwtSecreteKey?, expiryTTL?) {

  let ciphertext_auth_key = ciphertext_key ? ciphertext_key : config.CIPHER_SECRET;
  let jwtSecreteKey_auth_key = jwtSecreteKey ? jwtSecreteKey : config.JWT_SECRET;
  let expiry_TTL = expiryTTL ? expiryTTL : config.JWT_TTL;

  const ciphertext = crypto.AES.encrypt(JSON.stringify(data), ciphertext_auth_key);
  //Sign JWT, valid as per env hour
  return jwt.sign({ sub: ciphertext.toString() }, jwtSecreteKey_auth_key, { expiresIn: expiry_TTL });
}

export function generateJWTrefreshToken(data, ciphertext_key?, jwtSecreteKey?) {

  let ciphertext_auth_key = ciphertext_key ? ciphertext_key : config.CIPHER_SECRET;
  let jwtSecreteKey_auth_key = jwtSecreteKey ? jwtSecreteKey : config.JWT_REFERSH_SECRET;

  const ciphertext = crypto.AES.encrypt(JSON.stringify(data), ciphertext_auth_key);
  return jwt.sign({ sub: ciphertext.toString() }, jwtSecreteKey_auth_key);
}