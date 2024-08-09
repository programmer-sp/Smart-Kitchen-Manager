import dotenv from 'dotenv';
if (!dotenv) throw new Error('Unable to use dot env lib');

// This error should crash whole process
const envFound = dotenv.config();
if (!envFound) throw new Error("⚠️ Couldn't find .env file ⚠️");

export default {
	ENV: process.env.ENV,
	NODE_ENV: process.env.NODE_ENV,
	API_MODE: process.env.API_MODE,

	NAME: process.env.NAME,
	VERSION: process.env.VERSION,

	PORT: parseInt(process.env.PORT, 10),

	/* Ecryption Secret Keys */
	ENC_KEY: process.env.ENC_KEY,
	ENC_IV: process.env.ENC_IV,

	/* JWT Setup */
	JWT_SECRET: process.env.JWT_SECRET,
	CIPHER_SECRET: process.env.CIPHER_SECRET,
	JWT_REFERSH_SECRET: process.env.JWT_REFERSH_SECRET,
	JWT_TTL: process.env.JWT_TTL,
	JWT_REFERSH_TTL: process.env.JWT_REFERSH_TTL,

	/* MongoDB Credentials */
	MONGO_URI: process.env.MONGO_URI,
	MONGO_USER: process.env.MONGO_USER,
	MONGO_PASSWORD: process.env.MONGO_PASSWORD,
	MONGO_HOST: process.env.MONGO_HOST,
	MONGO_PORT: process.env.MONGO_PORT,
	MONGO_NAME: process.env.MONGO_NAME,

	/* PosgreSQL Credentials */
	DB_HOST: process.env.DB_HOST,
	DB_USER: process.env.DB_USER,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_NAME: process.env.DB_NAME,
	DB_PORT: process.env.DB_PORT,

	/* Redis Credentials  */
	REDIS_URL: process.env.REDIS_URL,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_USER: process.env.REDIS_USER,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_TTL: process.env.REDIS_TTL,

	/* SMTP Credentials */
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_FROM: process.env.SMTP_FROM,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASSWORD: process.env.SMTP_PASSWORD,

	/* Google Oauth2 cred - nodemailer */
	REDIRECT_URI: process.env.REDIRECT_URI,
	CLIENT_ID: process.env.CLIENT_ID,
	CLIENT_SECRET: process.env.CLIENT_SECRET,
	ACCESS_TOKEN: process.env.ACCESS_TOKEN,
	REFRESH_TOKEN: process.env.REFRESH_TOKEN,
	GOOGLE_AUTH_code: process.env.GOOGLE_AUTH_code,

	/* Developer Emails */
	DEV_EMAILS: process.env.DEV_EMAILS.split(','),

	/* Used by winston logger */
	LOGS: {
		LEVEL: process.env.LOG_LEVEL || 'silly',
		PATH: process.env.LOG_PATH || './',
	},

	/* API configs */
	API_PREFIX: '/',

	/* Base Url for Images */
	ASSETS_URL: `https://${process.env.S3_ASSETS_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/`,
	IMAGE_URL: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/`,
};