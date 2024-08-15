# -*- coding: utf-8 -*-
"""
Created on Thu Aug 15 18:17:06 2024

@author: Amitr
"""

import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

class PostgreSQLSetup:
    """
    Manages PostgreSQL database setup, including checking if the database exists,
    and creating tables if they do not already exist.
    
    Methods:
        connect() -> psycopg2.extensions.connection:
            Establishes a connection to the PostgreSQL database.
        create_database() -> None:
            Creates the database if it does not exist.
        create_tables() -> None:
            Creates the necessary tables in the PostgreSQL database.
        execute_query(query: str) -> None:
            Executes a given SQL query on the PostgreSQL database.
    """

    def __init__(self):
        """
        Initializes the PostgreSQLSetup class by loading environment variables and connecting to the database.
        """
        load_dotenv(override=True)
        self.connection = self.connect()
        self.create_database()

    def connect(self):
        """
        Establishes a connection to the PostgreSQL database.

        Returns:
            connection (psycopg2.extensions.connection): A connection to the PostgreSQL database.
        """
        try:
            connection = psycopg2.connect(
                dbname="postgres",  # Connect to the default database first
                user=os.getenv("POSTGRES_USERNAME"),
                password=os.getenv("POSTGRES_PASSWORD"),
                host=os.getenv("POSTGRES_HOST"),
                port=os.getenv("POSTGRES_PORT")
            )
            connection.autocommit = True
            print("Connected to PostgreSQL.")
            return connection
        except Exception as e:
            print(f"Error connecting to PostgreSQL: {e}")
            raise

    def create_database(self):
        """
        Creates the 'smart_kitchen_helper' database if it does not already exist.
        """
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", ('smart_kitchen_helper',))
                exists = cursor.fetchone()
                if not exists:
                    cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                        sql.Identifier('smart_kitchen_helper')))
                    print("Created database 'smart_kitchen_helper'.")
                else:
                    print("Database 'smart_kitchen_helper' already exists.")
        except Exception as e:
            print(f"Error creating database: {e}")
            raise

        # Reconnect to the new database
        self.connection.close()
        self.connection = psycopg2.connect(
            dbname="smart_kitchen_helper",
            user=os.getenv("POSTGRES_USERNAME"),
            password=os.getenv("POSTGRES_PASSWORD"),
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT")
        )
        self.connection.autocommit = True
        print("Reconnected to 'smart_kitchen_helper' database.")

    def execute_query(self, query: str):
        """
        Executes a given SQL query on the PostgreSQL database.

        Args:
            query (str): The SQL query to be executed.
        """
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query)
                print(f"Executed query: {query}")
        except Exception as e:
            print(f"Error executing query: {e}")
            raise

    def create_tables(self):
        """
        Creates the necessary tables in the PostgreSQL database.
        """
        queries = [
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS households (
                household_id SERIAL PRIMARY KEY,
                household_name VARCHAR(100) UNIQUE NOT NULL,
                address VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS household_users (
                household_user_id SERIAL PRIMARY KEY,
                household_id INT REFERENCES households(household_id) NOT NULL,
                user_id INT REFERENCES users(user_id) NOT NULL,
                role VARCHAR(20) DEFAULT 'member'
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS ingredient_categories (
                category_id SERIAL PRIMARY KEY,
                category_name VARCHAR(50) UNIQUE NOT NULL
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS ingredients (
                ingredient_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category_id INT REFERENCES ingredient_categories(category_id) ON DELETE SET NULL
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS stores (
                store_id SERIAL PRIMARY KEY,
                store_name VARCHAR(100) NOT NULL,
                address VARCHAR(255) NOT NULL,
                rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS ingredient_prices (
                price_id SERIAL PRIMARY KEY,
                ingredient_id INT REFERENCES ingredients(ingredient_id) NOT NULL,
                store_id INT REFERENCES stores(store_id) NOT NULL,
                price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
                unit VARCHAR(50) NOT NULL,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS household_ingredients (
                household_ingredient_id SERIAL PRIMARY KEY,
                household_id INT REFERENCES households(household_id) NOT NULL,
                ingredient_id INT REFERENCES ingredients(ingredient_id) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
                unit VARCHAR(50) NOT NULL,
                expiration_date DATE CHECK (expiration_date > CURRENT_DATE),
                is_expired BOOLEAN DEFAULT FALSE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS recipes (
                recipe_id SERIAL PRIMARY KEY,
                recipe_name VARCHAR(100) NOT NULL,
                cuisine VARCHAR(50),
                preparation_time INT CHECK (preparation_time >= 0),
                system_rating DECIMAL(2,1) CHECK (system_rating >= 0 AND system_rating <= 5),
                is_rated BOOLEAN DEFAULT FALSE,
                expiration_date DATE CHECK (expiration_date > CURRENT_DATE),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS recipe_ingredients (
                recipe_ingredient_id SERIAL PRIMARY KEY,
                recipe_id INT REFERENCES recipes(recipe_id) NOT NULL,
                ingredient_id INT REFERENCES ingredients(ingredient_id) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
                unit VARCHAR(50) NOT NULL
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS user_recipe_history (
                history_id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(user_id) NOT NULL,
                recipe_id INT REFERENCES recipes(recipe_id) NOT NULL,
                cooked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS user_ratings (
                rating_id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(user_id) NOT NULL,
                recipe_id INT REFERENCES recipes(recipe_id) NOT NULL,
                rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
                review TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        ]

        for query in queries:
            self.execute_query(query)

        print("All necessary tables have been created.")

if __name__ == "__main__":
    postgres_setup = PostgreSQLSetup()
    postgres_setup.create_tables()
