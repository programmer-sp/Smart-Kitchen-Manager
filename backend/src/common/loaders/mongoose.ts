import mongoose from 'mongoose';
import logger from '../loaders/logger';
import config from '../config';

mongoose.Promise = global.Promise;

mongoose.connection.on('error', (err) => {
    logger.errorAndMail({ e: `MongoDB connection error: ${err}` });
    process.exit(-1);
});

mongoose.connection.on('connected', () => {
    logger.info('MongoDB Connected...');
});

const connectMongo = () => {
    const options: any = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    if (config.NODE_ENV != 'development') {
        mongoose.connect(`mongodb://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_NAME}?authSource=admin`, options);
    } else {
        mongoose.set('debug', true);
        mongoose.connect(config.MONGO_URI, options);
    }

    return mongoose.connection;
};

export default connectMongo;