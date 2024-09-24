import config from '../config';
import ejs from 'ejs';
import path from 'path';
import * as nodemailer from 'nodemailer';
import logger from '../loaders/logger';
import { Service } from 'typedi';
import { EMAIL_CONSTANTS, APPLICATION_NAME } from '../utils/Constants';
// import { google } from 'googleapis';

// const oauth2Client = new google.auth.OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI);
// oauth2Client.setCredentials({ refresh_token: config.REFRESH_TOKEN });

@Service()
export class dynamicMailer {
    transporter;

    /* public constructor() {
        this.transporter = (async () => {
            try {
                const { token: accessToken } = await oauth2Client.getAccessToken();
                return await nodemailer.createTransport({
                    service: 'gmail',
                    host: config.SMTP_HOST,
                    auth: {
                        type: "OAuth2",
                        user: config.SMTP_USER,
                        clientId: config.CLIENT_ID,
                        clientSecret: config.CIPHER_SECRET,
                        refreshToken: config.REFRESH_TOKEN,
                        accessToken: accessToken,
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
            } catch (error) {
                logger.error(error);
            }
        })();
    } */

    public constructor() {
        this.transporter = (async () => {
            try {
                return await nodemailer.createTransport({
                    host: config.SMTP_HOST,
                    port: config.SMTP_PORT,
                    secure: false,
                    service: 'gmail',
                    auth: {
                        user: config.SMTP_USER,
                        pass: config.SMTP_PASSWORD,
                    },
                });
            } catch (error) {
                logger.error(error);
            }
        })();
    }

    public async APIBackendService(data: any) {
        const trans = await this.transporter;
        await trans.sendMail({
            from: {
                name: APPLICATION_NAME,
                address: config.SMTP_FROM,
            },
            to: data.to,
            cc: data.cc,
            subject: data.subject,
            html: data.body,
        });
    }

    public async reviewAction(data: Object) {
        const trans = await this.transporter;
        const titleMessage = `Your reivew on product ${data['productName']} has been ${data['status'] === 1 ? 'approved' : 'rejected'}`;
        ejs.renderFile(
            path.join(__dirname, '../views/emails', 'reviewAction.ejs'),
            {
                assets: EMAIL_CONSTANTS,
                year: new Date().getFullYear(),
                data,
                titleMessage
            },
            function (err: any, body: any) {
                if (err) logger.error(err);
                else {
                    trans.sendMail({
                        from: {
                            name: EMAIL_CONSTANTS['websiteName'],
                            address: config.SMTP_FROM,
                        },
                        to: data['receiverEmail'],
                        subject: titleMessage,
                        html: body,
                    }, (error: any, info: any) => {
                        if (error) logger.errorAndMail(error);
                        else logger.info('Email sent: ' + info.response);
                    });
                }
            },
        );
    }

    public async emailVerification(data: Object) {
        const trans = await this.transporter;
        const invitationLink = `${EMAIL_CONSTANTS['websiteUrl']}verify/${data['invitationToken']}`;
        ejs.renderFile(
            path.join(__dirname, '../views/emails', 'emailVerification.ejs'),
            {
                assets: EMAIL_CONSTANTS,
                year: new Date().getFullYear(),
                verify_link: invitationLink,
                data,
            },
            function (err: any, body: any) {
                if (err) logger.error(err);
                else {
                    trans.sendMail({
                        from: {
                            name: EMAIL_CONSTANTS['websiteName'],
                            address: config.SMTP_FROM,
                        },
                        to: data['receiverEmail'],
                        subject: `${EMAIL_CONSTANTS['websiteName']} Account - Verify Email Address`,
                        html: body,
                    }, (error: any, info: any) => {
                        if (error) logger.errorAndMail(error);
                        else logger.info('Email sent: ' + info.response);
                    });
                }
            },
        );
    }

    public async purchase(data: Object) {
        const trans = await this.transporter;
        ejs.renderFile(
            path.join(__dirname, '../views/emails', 'purchase.ejs'),
            {
                assets: EMAIL_CONSTANTS,
                year: new Date().getFullYear(),
                data,
            },
            function (err: any, body: any) {
                if (err) logger.error(err);
                else {
                    trans.sendMail({
                        from: {
                            name: EMAIL_CONSTANTS['websiteName'],
                            address: config.SMTP_FROM,
                        },
                        to: data['receiverEmail'],
                        subject: `${EMAIL_CONSTANTS['websiteName']} Purchase`,
                        html: body,
                    }, (error: any, info: any) => {
                        if (error) logger.errorAndMail(error);
                        else logger.info('Email sent: ' + info.response);
                    });
                }
            },
        );
    }

    public async emailVendor(data: Object) {
        const trans = await this.transporter;
        const titleMessage = `Your product has been reviewd by a customer`;
        ejs.renderFile(
            path.join(__dirname, '../views/emails', 'emailVendor.ejs'),
            {
                assets: EMAIL_CONSTANTS,
                year: new Date().getFullYear(),
                data,
                titleMessage
            },
            function (err: any, body: any) {
                if (err) logger.error(err);
                else {
                    trans.sendMail({
                        from: {
                            name: EMAIL_CONSTANTS['websiteName'],
                            address: config.SMTP_FROM,
                        },
                        to: data['receiverEmail'],
                        subject: titleMessage,
                        html: body,
                    }, (error: any, info: any) => {
                        if (error) logger.errorAndMail(error);
                        else logger.info('Email sent: ' + info.response);
                    });
                }
            },
        );
    }
}
