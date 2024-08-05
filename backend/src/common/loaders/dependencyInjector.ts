import { Container } from 'typedi';
import logger from './logger';
import { redisClient } from './redis';

export default async () => {
    try {
        await redisClient.connect();

        /* Load redis */
        Container.set('redis', redisClient);
        logger.debug('Redis added to container');
    } catch (error) {
        logger.error(`Failed to load dependencies: ${error}`);
    }
};
