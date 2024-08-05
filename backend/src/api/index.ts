import { Router } from 'express';
import users from './routes/users';

export default () => {
    const app = Router();

    // API routes
    users(app);

    return app;
};