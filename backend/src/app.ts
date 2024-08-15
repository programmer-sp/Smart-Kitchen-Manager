import config from './common/config';
import express from 'express';
import * as path from 'path';
import helmet from 'helmet';
import loaders from './common/loaders';
import logger from './common/loaders/logger';
import * as l10n from 'jm-ez-l10n';
import fs from 'fs';
import https from 'https';

async function startServer() {
	const app = express();

	await loaders({ expressApp: app });
	app.use(express.static(path.join(__dirname, 'public')));

	l10n.setTranslationsFile('en', __dirname + '/common/language/translation.en.json');
	app.use(l10n.enableL10NExpress);

	app.use(helmet());

	// Load SSL certificates
	const options = {
		key: fs.readFileSync("server.key"),
		cert: fs.readFileSync("server.cert"),
	};

	https.createServer(options, app).listen(config.PORT, (err?: any) => {
		if (err) {
			logger.info(err);
			process.exit(1);
		}
		logger.info(`
	################################################################
	🛡️  Server listening on port:\x1b[37m\x1b[1m ${config.PORT}\x1b[0m with node version:\x1b[37m\x1b[1m ${process.versions.node}\x1b[0m 🛡️
	################################################################
		`);
	});
}

startServer();
