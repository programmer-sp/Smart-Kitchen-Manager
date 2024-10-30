import config from '../common/config';
import { Router } from 'express';
import auth from './routes/auth';
import admin from './routes/admin';
import user from './routes/users';
import household from './routes/households';
import ingredient from './routes/ingredient';
import store from './routes/store';
import recipe from './routes/recipe';

export default () => {
    const app = Router();

    // API routes
    auth(app);
    admin(app);
    user(app);
    household(app);
    ingredient(app);
    store(app);
    recipe(app);

    // Web-Page routes
    app.get('/', function (req, res) { return res.render('index.ejs', { baseUrl: config.BASE_URL }); });
    app.get('/login', function (req, res) { return res.render('login.ejs', { baseUrl: config.BASE_URL }); });
    app.get('/signup', function (req, res) { return res.render('signup.ejs', { baseUrl: config.BASE_URL }); });
    app.get('/homepage', function (req, res) { return res.render('homepage.ejs', { baseUrl: config.BASE_URL }); });
    app.get('/verify/:invite_token', function (req, res) { return res.render('verify.ejs', { baseUrl: config.BASE_URL }); });
    app.get('/find_recipes', function (req, res) { return res.render('find_recipes.ejs', { baseUrl: config.BASE_URL }); });

    return app;
};