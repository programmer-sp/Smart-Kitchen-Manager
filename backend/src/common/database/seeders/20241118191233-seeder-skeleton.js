'use strict';

const bcrypt = require('bcryptjs');
const _crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Users', [
      {
        user_id: 1,
        username: this.encryptData('sptest11'),
        email: this.encryptData('sptest11@mailinator.com'),
        role: 'administrator',
        email_verified: true,
        password_hash: await this.encryptPass('Password@123'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 2,
        username: this.encryptData('sptest10'),
        email: this.encryptData('sptest10@mailinator.com'),
        role: 'member',
        email_verified: true,
        password_hash: await this.encryptPass('Password@123'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 3,
        username: this.encryptData('sptest9'),
        email: this.encryptData('sptest9@mailinator.com'),
        role: 'member',
        email_verified: true,
        password_hash: await this.encryptPass('Password@123'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 4,
        username: this.encryptData('sptest8'),
        email: this.encryptData('sptest8@mailinator.com'),
        role: 'member',
        email_verified: true,
        password_hash: await this.encryptPass('Password@123'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Users_user_id_seq" RESTART WITH ${5}`,
    );

    await queryInterface.bulkInsert('Households', householdData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Households_household_id_seq" RESTART WITH ${householdData.length + 1}`,
    );

    await queryInterface.bulkInsert('Household_Users', householdUsersData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Household_Users_household_user_id_seq" RESTART WITH ${householdUsersData.length + 1}`,
    );

    await queryInterface.bulkInsert('Ingredient_Categories', ingdCategoryData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Ingredient_Categories_category_id_seq" RESTART WITH ${ingdCategoryData.length + 1}`,
    );

    await queryInterface.bulkInsert('Ingredients', ingredientData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Ingredients_ingredient_id_seq" RESTART WITH ${ingredientData.length + 1}`,
    );

    await queryInterface.bulkInsert('Household_Ingredients', householdIngredientData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Household_Ingredients_household_ingredient_id_seq" RESTART WITH ${householdIngredientData.length + 1}`,
    );

    await queryInterface.bulkInsert('Stores', storeData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Stores_store_id_seq" RESTART WITH ${storeData.length + 1}`,
    );

    await queryInterface.bulkInsert('Ingredient_Prices', ingdPriceData, {});

    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "Ingredient_Prices_price_id_seq" RESTART WITH ${ingdPriceData.length + 1}`,
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Household_Ingredients', null, {});
    await queryInterface.bulkDelete('Household_Users', null, {});
    await queryInterface.bulkDelete('Households', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Ingredient_Prices', null, {});
    await queryInterface.bulkDelete('Ingredients', null, {});
    await queryInterface.bulkDelete('Ingredient_Categories', null, {});
    await queryInterface.bulkDelete('Stores', null, {});
  },

  encryptData(data) {
    let cipher = _crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.ENC_KEY, "hex"), Buffer.from(process.env.ENC_IV, "hex"));
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  },

  async encryptPass(data) {
    const salt = await bcrypt.genSalt(10);
    const encryptpassword = await bcrypt.hash(data, salt);
    return encryptpassword;
  },
};

const householdData = [
  {
    household_id: 1,
    household_name: 'chitfund',
    address: 'Harmony terminal',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const householdUsersData = [
  {
    household_user_id: 1,
    household_id: 1,
    user_id: 2,
    role: 'owner',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_user_id: 2,
    household_id: 1,
    user_id: 3,
    role: 'member',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_user_id: 3,
    household_id: 1,
    user_id: 4,
    role: 'guest',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const ingdCategoryData = [
  {
    category_id: 1,
    category_name: 'veggies',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category_id: 2,
    category_name: 'seasoning',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const ingredientData = [
  {
    ingredient_id: 1,
    name: 'black pepper',
    category_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 2,
    name: 'red pepper',
    category_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 3,
    name: 'salt',
    category_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 4,
    name: 'cumin seeds',
    category_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 5,
    name: 'mustard seeds',
    category_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 6,
    name: 'turmeric',
    category_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 7,
    name: 'tomato',
    category_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 8,
    name: 'patato',
    category_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 9,
    name: 'onion',
    category_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 10,
    name: 'garlic',
    category_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 11,
    name: 'red chili',
    category_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ingredient_id: 12,
    name: 'green chili',
    category_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const householdIngredientData = [
  {
    household_ingredient_id: 1,
    household_id: 1,
    ingredient_id: 1,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 2,
    household_id: 1,
    ingredient_id: 2,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 3,
    household_id: 1,
    ingredient_id: 3,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 4,
    household_id: 1,
    ingredient_id: 4,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 5,
    household_id: 1,
    ingredient_id: 5,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 6,
    household_id: 1,
    ingredient_id: 6,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 7,
    household_id: 1,
    ingredient_id: 7,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 8,
    household_id: 1,
    ingredient_id: 8,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 9,
    household_id: 1,
    ingredient_id: 9,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 10,
    household_id: 1,
    ingredient_id: 10,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 11,
    household_id: 1,
    ingredient_id: 11,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    household_ingredient_id: 12,
    household_id: 1,
    ingredient_id: 12,
    quantity: 1,
    unit: 'kg',
    expiration_date: '12-31-2024',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const storeData = [
  {
    store_id: 1,
    store_name: 'walmart',
    address: 'harmony terminal',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const ingdPriceData = [
  {
    price_id: 1,
    store_id: 1,
    ingredient_id: 1,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 2,
    store_id: 1,
    ingredient_id: 2,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 3,
    store_id: 1,
    ingredient_id: 3,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 4,
    store_id: 1,
    ingredient_id: 4,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 5,
    store_id: 1,
    ingredient_id: 5,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 6,
    store_id: 1,
    ingredient_id: 6,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 7,
    store_id: 1,
    ingredient_id: 7,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 8,
    store_id: 1,
    ingredient_id: 8,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 9,
    store_id: 1,
    ingredient_id: 9,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 10,
    store_id: 1,
    ingredient_id: 10,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 11,
    store_id: 1,
    ingredient_id: 11,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    price_id: 12,
    store_id: 1,
    ingredient_id: 12,
    price: 5,
    unit: 'kg',
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];