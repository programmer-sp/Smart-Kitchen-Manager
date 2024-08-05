import { createClient } from "redis";
import config from '../config';

export const redisClient = createClient({ url: `redis://${config.REDIS_URL}:${config.REDIS_PORT}`, password: config.REDIS_PASSWORD });