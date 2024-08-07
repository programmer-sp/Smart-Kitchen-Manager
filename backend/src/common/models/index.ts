import { dbConfig } from '../loaders/pgsql';
import { usersFactory } from './Users.model';
import { housesFactory } from '../models/houses.model';
import { ingredientsFactory } from './Ingredients.model';
import {storesFactory} from './Stores.model';

// dbConfig.sync({}).then(() => {
//     console.log(`Database & tables created!`)
// });

export const Users = usersFactory(dbConfig);
export const Houses = housesFactory(dbConfig);
export const Ingredients = ingredientsFactory(dbConfig);
export const Stores = storesFactory(dbConfig);

Users.belongsTo(Houses, { as: 'user', foreignKey: 'userId' });

Houses.hasMany(Users, { as: 'users', foreignKey: 'userId' });

Ingredients.belongsTo(Houses, { as: 'ingredient', foreignKey: 'houseId' });

Houses.hasMany(Ingredients, { as: 'ingredients', foreignKey: 'houseId' });