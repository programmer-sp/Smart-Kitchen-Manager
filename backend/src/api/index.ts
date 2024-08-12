import { Router } from 'express';
import auth from './routes/auth';
import admin from './routes/admin';
import user from './routes/users';
import household from './routes/households';
import category from './routes/category';

export default () => {
    const app = Router();

    // API routes
    auth(app);
    admin(app);
    user(app);
    household(app);
    category(app);

    return app;
};