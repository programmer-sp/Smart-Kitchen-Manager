import winston from 'winston';
import config from '../config';
import sendLoggerEmail from '../services/sendLogEmail';

const transports = [];
if (process.env.NODE_ENV === 'production') {
	transports.push(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.printf(
					info => `${info.timestamp} ${info.level}: ${info.message}`
				)
			)
		}),
		new winston.transports.File({
			filename: config.LOGS.PATH + 'combined.log',
			maxsize: 2048,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(
					info => `${info.timestamp} ${info.level}: ${info.message}`
				)
			)
		}),
		new winston.transports.File({
			filename: config.LOGS.PATH + 'error.log',
			maxsize: 2048,
			level: 'error',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(
					info => `${info.timestamp}: ${info.message}`
				)
			)
		})
	);
} else {
	transports.push(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.cli(),
				winston.format.splat()
			)
		})
	);
}

const logger = <any>winston.createLogger({
	level: config.LOGS.LEVEL,
	levels: winston.config.npm.levels,
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json()
	),
	transports
});

logger.errorAndMail = async ({
	e,
	routeName = '',
	functionName = '',
}: {
	e: any;
	routeName?: string;
	functionName?: string;
}) => {
	logger.error(e);

	let email: Array<string> | string;
	const emails: Array<string> = config.DEV_EMAILS;
	if (emails.length > 0) email = emails.shift();
	else email = emails;

	if (!email && emails.length === 0) {
		logger.error('No email found in env to send to developers');
	} else {
		if (config.NODE_ENV != 'development') {
			return Promise.resolve(
				sendLoggerEmail(e, email, emails, routeName, functionName),
			).catch((err) => {
				logger.error('Error sending job emails. Error: %o', err);
			});
		}
	}
};

export default logger;