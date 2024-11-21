import { connect, connection, set } from "mongoose";
import config from '../config';
import logger from '../loaders/logger';
import ingredientModel from '../models/Ingredient_Details.model';
import recipeModel from '../../common/models/Recipe_Details.model';

const mongoUri = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_NAME}`;  //for local database
/* let mongoUri;
if (config.NODE_ENV === 'development') mongoUri = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_NAME}`;
else mongoUri = `mongodb://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_NAME}?authSource=admin`; */

connect(mongoUri).then(() => {
    logger.info(`
	    #########################
	    🛡️  \x1b[37m\x1b[1m MongoDB Connected \x1b[0m 🛡️
	    #########################
	`);
    set('debug', true);
}).catch((err) => {
    logger.error(err);
    process.exit(1);
});

const seed = async () => {
    await ingredientModel.deleteMany({});
    await ingredientModel.insertMany(ingredientData);

    await recipeModel.deleteMany({});
    await recipeModel.insertMany(recipeData);
};

seed().then(() => {
    connection.close();
    process.exit();
});

const ingredientData = [
    {
        ingredient_id: 1,
        name: 'black pepper',
        category: 'seasoning',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 2,
        name: 'red pepper',
        category: 'seasoning',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 3,
        name: 'salt',
        category: 'seasoning',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 4,
        name: 'cumin seeds',
        category: 'seasoning',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 5,
        name: 'mustard seeds',
        category: 'seasoning',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 6,
        name: 'turmeric',
        category: 'seasoning',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 7,
        name: 'tomato',
        category: 'veggies',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 8,
        name: 'patato',
        category: 'veggies',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 9,
        name: 'onion',
        category: 'veggies',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 10,
        name: 'garlic',
        category: 'veggies',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 11,
        name: 'red chili',
        category: 'veggies',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
    {
        ingredient_id: 12,
        name: 'green chili',
        category: 'veggies',
        unit: 'kg',
        value: 1,
        image_url: '',
        nutritional_info: { "sugar": 0 },
    },
];

const recipeData = [
    {
        recipe_id: 1,
        recipe_name: 'Noodle',
        cuisine: 'Chinese',
        preparation_time: 5,
        system_rating: 4,
        expiration_date: '12-31-2024',
        ingredients: [
            {
                recipe_ingredient_id: 1,
                recipe_id: 1,
                ingredient_id: 3,
                quantity: 1,
                unit: "table spoon",
                ingredient_name: "salt",
                ingredient_category_id: 2
            },
            {
                recipe_ingredient_id: 2,
                recipe_id: 1,
                ingredient_id: 2,
                quantity: 1,
                unit: "table spoon",
                ingredient_name: "red pepper",
                ingredient_category_id: 2
            }
        ],
        steps: [
            "step 1: boil water",
            "step 2: add noodle",
            "step 3: add noodle massala",
            "step 4: wait until noodle gets cooked"
        ],
        images: [
            "https://smart-kitchen-helper.s3.ca-central-1.amazonaws.com/recipes/1732134524814.png",
            "https://smart-kitchen-helper.s3.ca-central-1.amazonaws.com/recipes/1732134525579.png"
        ],
        video_url: "https://smart-kitchen-helper.s3.ca-central-1.amazonaws.com/recipes/1732134525728.mp4",
    }
];