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
  REVIEW = 'Review',
  VENDOR = 'Vendor',
  HOUSEHOLD = 'Household',
  HOUSE = 'House',
  INGREDIENT = 'Ingredient',
  PRICE = 'Price',
  STORE = 'Store',
  RECIPE = 'Recipe'
};

export const BACKEND_SLUGS = {
  PURCHASE: 'Ecomiq Purchase',
  CURRENCY_TYPE: 'CAD',
  PURCHASE_DESCRIPTION: 'Purchase description'
};

export const APPLICATION_NAME = 'Smart-Kitchen-Helper';

export const UNDER_MAINTANANCE = 'Under Maintenance';

export enum RESPONSE_METHOD {
  CREATE = 'created',
  READ = 'get',
  UPDATE = 'updated',
  DELETE = 'deleted',
  LOGGEDIN = 'logged in',
  LOGGEDOUT = 'logged out',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ADDED = 'added',
  ADD = 'add',
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
  INGREDIENT_LIST: `${APPLICATION_NAME.toLowerCase()}:ingredient-list`,
  INGREDIENT_PRICE_LIST: `${APPLICATION_NAME.toLowerCase()}:ingredient-price-list`,
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

  welcomeBanner: path.join(__dirname, '../public/img', 'welcome-banner.png'),
  checkMarkImg: path.join(__dirname, '../public/img', 'check-mark.png'),

  playStoreImg: path.join(__dirname, '../public/img', 'google-app.png'),
  appStoreImg: path.join(__dirname, '../public/img', 'app-store.png'),

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