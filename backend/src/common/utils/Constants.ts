import path from 'path';
import config from '../config';

export enum MODULE_NAME {
  GLOBAL_SETTINGS = 'Global settings',
  ADMIN = 'Admin',
  USER = 'User',
  PRODUCT = 'Product',
  PLAN = 'Plan',
  PAYMENT = 'Payment',
  PRICING_PLAN = 'Pricing plans',
  COUPON = 'Coupon',
  TOKEN = 'Token',
  AUTH = 'Authorization',
  CATEGORY = 'Category',
  CART = 'Cart',
  ORDER = 'Order',
  REVIEW = 'Review',
  VENDOR = 'Vendor'
};

export const BACKEND_SLUGS = {
  PURCHASE: 'Ecomiq Purchase',
  CURRENCY_TYPE: 'CAD',
  PURCHASE_DESCRIPTION: 'Purchase description'
};

export const APPLICATION_NAME = 'Ecomiq';

export const UNDER_MAINTANANCE = 'Under Maintenance';

export enum RESPONSE_METHOD {
  CREATE = 'created',
  READ = 'get',
  UPDATE = 'updated',
  DELETE = 'deleted',
  LOGGEDIN = 'logged in',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ADDED = 'added',
  APPLIED = 'applied',
  REMOVED = 'removed',
  PLACED = 'placed',
  VERIFIED = 'verified',
  EXECUTED = 'executed'
};

export const REDIS_KEYS = {
  USER_INFO: 'user-i-',
  USER_APPS: 'user-a-',
  USER_TOKEN: 'user-t-',
  USER_DEVICE: 'user-d-',
  USER_REFRESH_TOKEN: 'user-rt-',
  USER_INVITE_RESEND: 'user-rsd-',
  USER_VERIFICATION_CODE: 'user-vc-',
  CATEGORY_LIST: `${APPLICATION_NAME.toLowerCase()}:category-list`,
  PRODUCT_LIST: `${APPLICATION_NAME.toLowerCase()}:product-list`,
  COUPON_LIST: `${APPLICATION_NAME.toLowerCase()}:coupon-list`,
  VENDOR_LIST: `${APPLICATION_NAME.toLowerCase()}:vendor-list`,
  USER_CART: `${APPLICATION_NAME.toLowerCase()}:user-cart`,
  USER_REVIEW: `${APPLICATION_NAME.toLowerCase()}:user-review`,
};

export const REDIS_EXPIRE_TIME = {
  MILLISECONDS: 'PX',
  SECONDS: 'EX',
};

// TODO: discord and T&C
export const EMAIL_CONSTANTS: object = {
  websiteName: config.NAME,
  websiteUrl: `https://localhost:${config.PORT}/`,

  welcomeBanner: `https://account-files-bucket.s3.ap-south-1.amazonaws.com/universe/email-template-assets/welcome-banner.png`,
  checkMarkImg: `https://account-files-bucket.s3.ap-south-1.amazonaws.com/universe/email-template-assets/check.png`,

  playStoreImg: `https://account-files-bucket.s3.ap-south-1.amazonaws.com/universe/email-template-assets/google-app.png`,
  appStoreImg: `https://account-files-bucket.s3.ap-south-1.amazonaws.com/universe/email-template-assets/app-store.png`,
  /* welcomeBanner: path.join(__dirname, '../public/img', 'welcome-banner.png'),
  checkMarkImg: path.join(__dirname, '../public/img', 'check-mark.png'),

  playStoreImg: path.join(__dirname, '../public/img', 'google-app.png'),
  appStoreImg: path.join(__dirname, '../public/img', 'app-store.png'), */

  playStoreUrl: `https://play.google.com/store/apps`,
  appStoreUrl: `https://apps.apple.com/in/developer`,

  helpDeskMail: config.SMTP_FROM,
  helpDeskUrl: `mailto:${config.SMTP_FROM}`,

  linkedIn: `https://www.linkedin.com/company/Ecomiq`,
  twitter: `https://twitter.com/Ecomiq`,
  facebook: `https://www.facebook.com/Ecomiq`,
  instagram: `https://www.instagram.com/ecomiq`,
  // discord: `https://discord.gg/4zhR9hPFR8`,
  discord: `javascript:void(0);`,

  privacyPolicy: `javascript:void(0);`,
  termsCondition: `javascript:void(0);`,
};

export const langCodesStopwords = [
  "_123",
  "afr",
  "ara",
  "hye",
  "eus",
  "ben",
  "bre",
  "bul",
  "cat",
  "zho",
  "hrv",
  "ces",
  "dan",
  "nld",
  "eng",
  "epo",
  "est",
  "fin",
  "fra",
  "glg",
  "deu",
  "ell",
  "guj",
  "hau",
  "heb",
  "hin",
  "hun",
  "ind",
  "gle",
  "ita",
  "jpn",
  "kor",
  "kur",
  "lat",
  "lav",
  "lit",
  "lgg",
  "lggNd",
  "msa",
  "mar",
  "mya",
  "nob",
  "fas",
  "pol",
  "por",
  "porBr",
  "panGu",
  "ron",
  "rus",
  "slk",
  "slv",
  "som",
  "sot",
  "spa",
  "swa",
  "swe",
  "tgl",
  "tha",
  "tur",
  "ukr",
  "urd",
  "vie",
  "yor",
  "zul",
];