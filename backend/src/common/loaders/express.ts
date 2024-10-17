import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import { isCelebrateError } from 'celebrate';
import common_routes from '../../api';
import config from '../config';
import status_code from '../utils/statusCode';
import path from 'path';

export default ({ app }: { app: express.Application }) => {

	/* Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
	It shows the real origin IP in the heroku or Cloudwatch logs */
	app.enable('trust proxy');

	app.use(
		morgan(
			'method: :method :url status: :status :res[content-length] response-time: :response-time ms',
		),
	);

	/* The magic package that prevents frontend developers going nuts
	  Alternate description: Enable Cross Origin Resource Sharing to all origins by default */
	app.use(cors({
		'origin': '*',
		'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
		'preflightContinue': false
	}));

	/* Middleware that transforms the raw string of req.body into json */
	app.use(bodyParser.json({ limit: '50mb' }));
	/* support parsing of application/x-www-form-urlencoded post data */
	app.use(
		bodyParser.urlencoded({
			limit: '150mb',
			extended: true,
			parameterLimit: 500000000
		})
	);

	if (config.API_MODE === 'true') app.set('views', 'src/views');
	else {
		app.set('views', path.join(__dirname, '..', '..', '..', '..', 'frontend'));
		app.use(express.static(path.join(__dirname, '..', '..', '..', '..', 'frontend')));
	}
	app.set('view engine', 'ejs');

	// Load API routes
	app.use(config.API_PREFIX, common_routes());

	/* Catch celebrate generated errors */
	app.use((err: any, req: any, res: any, next: any) => {
		if (isCelebrateError) { //if joi produces an error, it's likely a client-side problem
			if (err.details.get('body')) {

				const errorBody = err.details.get('body'); // 'details' is a Map()
				let { details } = errorBody;
				details = details[0];
				return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: details.message });

			} else if (err.details.get('query')) {

				const errorBody = err.details.get('query'); // 'details' is a Map()
				let { details } = errorBody;
				details = details[0];
				return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: details.message });

			} else if (err.details.get('params')) {

				const errorBody = err.details.get('params'); // 'details' is a Map()
				let { details } = errorBody;
				details = details[0];
				return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: details.message });

			} else if (err.details.get('headers')) {

				const errorBody = err.details.get('headers'); // 'details' is a Map()
				let { details } = errorBody;
				details = details[0];
				return res.status(status_code.BAD_REQUEST).json({ status: status_code.BAD_REQUEST, message: details.message });
			}
		}
		next(err);
	});

	// Health check endpoint
	app.get('/health', (req, res) => {
		res.status(200).json({ status: 'UP', message: 'Health check passed' });
	});

	/* Catch 404 and forward to error handler */
	app.use((req, res, next) => {
		// Global.routeError = true;
		const err = new Error('Route Not Found');
		err['status'] = status_code.NOTFOUND;
		next(err);
	});

	/* Error handlers */
	app.use((err: any, req: any, res: any, next: any) => {
		/* Handle 401 thrown by express-jwt library */
		if (err.name === 'UnauthorizedError') {
			return res.status(err.status).send({ message: err.message }).end();
		}
		return next(err);
	});

	app.use((err: any, req: any, res: any, next: any) => {
		res.status(err.status || status_code.INTERNAL_SERVER_ERROR);
		res.json({ errors: { message: err.message } });
	});
};