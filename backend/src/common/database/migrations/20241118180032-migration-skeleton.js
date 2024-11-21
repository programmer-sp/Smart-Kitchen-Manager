'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: Sequelize.ENUM('guest', 'member', 'owner', 'moderator', 'administrator', 'content creator', 'viewer'),
        defaultValue: 'viewer',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      invitation_token: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Households', {
      household_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      household_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Household_Users', {
      household_user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      household_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Households',
          key: 'household_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('guest', 'member', 'owner', 'moderator', 'administrator', 'content creator', 'viewer'),
        defaultValue: 'member',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Stores', {
      store_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      store_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Ingredient_Categories', {
      category_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Ingredients', {
      ingredient_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Ingredient_Categories',
          key: 'category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Household_Ingredients', {
      household_ingredient_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      household_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Households',
          key: 'household_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ingredient_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Ingredients',
          key: 'ingredient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      unit: {
        type: Sequelize.STRING
      },
      expiration_date: {
        type: Sequelize.DATE,
      },
      is_expired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Ingredient_Prices', {
      price_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      store_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Stores',
          key: 'store_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ingredient_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Ingredients',
          key: 'ingredient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      price: {
        type: Sequelize.INTEGER
      },
      unit: {
        type: Sequelize.STRING
      },
      last_updated: {
        type: Sequelize.DATE,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Recipes', {
      recipe_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      recipe_name: {
        type: Sequelize.STRING
      },
      cuisine: {
        type: Sequelize.STRING
      },
      preparation_time: {
        type: Sequelize.INTEGER
      },
      system_rating: {
        type: Sequelize.INTEGER
      },
      is_rated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      expiration_date: {
        type: Sequelize.DATE,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('Recipe_Ingredients', {
      recipe_ingredient_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipes',
          key: 'recipe_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ingredient_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Ingredients',
          key: 'ingredient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      unit: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('User_Recipe_History', {
      history_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipes',
          key: 'recipe_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cooked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('User_Ratings', {
      rating_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipes',
          key: 'recipe_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
      },
      review: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Household_Users');
    await queryInterface.dropTable('Household_Ingredients');
    await queryInterface.dropTable('Ingredient_Prices');
    await queryInterface.dropTable('User_Ratings');
    await queryInterface.dropTable('User_Recipe_History');
    await queryInterface.dropTable('Recipe_Ingredients');
    await queryInterface.dropTable('Ingredients');
    await queryInterface.dropTable('Ingredient_Categories');
    await queryInterface.dropTable('Households');
    await queryInterface.dropTable('Stores');
    await queryInterface.dropTable('Recipes');
    await queryInterface.dropTable('Users');
  }
};
