import { dbConfig } from '../loaders/pgsql';

import { Users_Factory } from '../models/Users.model';
import { Household_Ingredients_Factory } from '../models/Household_Ingredients.model';
import { Household_Users_Factory } from '../models/Household_Users.model';
import { Households_Factory } from '../models/Households.model';
import { Ingredient_Categories_Factory } from '../models/Ingredient_Categories.model';
import { Ingredient_Prices_Factory } from '../models/Ingredient_Prices.models';
import { Ingredients_Factory } from '../models/Ingredients.model';
import { Recipe_Ingredients_Factory } from '../models/Recipe_Ingredients.model';
import { User_Ratings_Factory } from '../models/User_Ratings.model';
import { User_Recipe_History_Factory } from '../models/User_Recipe_History.model';
import { Recipes_Factory } from '../models/Recipes.model';
import { Stores_Factory } from '../models/Stores.model';

// dbConfig.sync({}).then(() => {
//     console.log(`Database & tables created!`)
// });

export const Users = Users_Factory(dbConfig);
export const Household_Ingredients = Household_Ingredients_Factory(dbConfig);
export const Household_Users = Household_Users_Factory(dbConfig);
export const Households = Households_Factory(dbConfig);
export const Ingredient_Categories = Ingredient_Categories_Factory(dbConfig);
export const Ingredient_Prices = Ingredient_Prices_Factory(dbConfig);
export const Ingredients = Ingredients_Factory(dbConfig);
export const Recipe_Ingredients = Recipe_Ingredients_Factory(dbConfig);
export const User_Ratings = User_Ratings_Factory(dbConfig);
export const User_Recipe_History = User_Recipe_History_Factory(dbConfig);
export const Recipes = Recipes_Factory(dbConfig);
export const Stores = Stores_Factory(dbConfig);


Household_Ingredients.hasMany(Households, { foreignKey: 'household_id', onDelete: 'CASCADE' });
Households.belongsTo(Household_Ingredients, { foreignKey: 'household_id', onDelete: 'CASCADE' });
Household_Ingredients.hasMany(Ingredients, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });
Ingredients.belongsTo(Household_Ingredients, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });

Household_Users.hasMany(Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Users.belongsTo(Household_Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Household_Users.hasMany(Households, { foreignKey: 'household_id', onDelete: 'CASCADE' });
Households.belongsTo(Household_Users, { foreignKey: 'household_id', onDelete: 'CASCADE' });

Ingredient_Prices.hasMany(Ingredients, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });
Ingredients.belongsTo(Ingredient_Prices, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });
Ingredient_Prices.hasMany(Stores, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Stores.belongsTo(Ingredient_Prices, { foreignKey: 'store_id', onDelete: 'CASCADE' });

Ingredients.hasMany(Ingredient_Categories, { foreignKey: 'category_id', onDelete: 'CASCADE' });
Ingredient_Categories.belongsTo(Ingredients, { foreignKey: 'category_id', onDelete: 'CASCADE' });

Recipe_Ingredients.hasMany(Ingredients, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });
Ingredients.belongsTo(Recipe_Ingredients, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });
Recipe_Ingredients.hasMany(Recipes, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
Recipes.belongsTo(Recipe_Ingredients, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });

User_Ratings.hasMany(Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Users.belongsTo(User_Ratings, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User_Ratings.hasMany(Recipes, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
Recipes.belongsTo(User_Ratings, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });

User_Recipe_History.hasMany(Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Users.belongsTo(User_Recipe_History, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User_Recipe_History.hasMany(Recipes, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
Recipes.belongsTo(User_Recipe_History, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });