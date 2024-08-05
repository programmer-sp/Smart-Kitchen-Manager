import expressLoader from './express';
import connectMongo from './mongoose';
import pgsql from './pgsql';
import logger from './logger';
import dependencyInjector from './dependencyInjector';

export default async ({ expressApp }) => {
	// Establish a database connection for node's process
	await connectMongo();
	await pgsql();

	// Load dependencies
	await dependencyInjector();
	logger.info('✌️ Dependency injector loaded');

	await expressLoader({ app: expressApp });
	logger.info('✌️ Express loaded');
};
