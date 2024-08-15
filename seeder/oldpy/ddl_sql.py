import psycopg2
from psycopg2 import sql
import pymongo
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PostgreSQL connection parameters
PG_DATABASE = 'smart_kitchen_helper'
PG_USER = 'postgres'
PG_PASSWORD = 'root'
PG_HOST = 'localhost'
PG_PORT = '5432'

# MongoDB connection parameters
MONGO_URI = 'mongodb://localhost:27017/'
MONGO_DATABASE = 'smart_kitchen_helper'

def drop_and_create_pg_db():
    """Drop the PostgreSQL database if it exists and create a new one."""
    conn = psycopg2.connect(
        dbname='postgres',  # Connect to the default database
        user=PG_USER,
        password=PG_PASSWORD,
        host=PG_HOST,
        port=PG_PORT
    )
    conn.autocommit = True  # Required to execute DROP DATABASE
    cursor = conn.cursor()
    
    try:
        # Drop the database if it exists
        cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(PG_DATABASE)))
        logger.info(f"PostgreSQL database '{PG_DATABASE}' dropped successfully.")
        
        # Create the database
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(PG_DATABASE)))
        logger.info(f"PostgreSQL database '{PG_DATABASE}' created successfully.")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
    finally:
        cursor.close()
        conn.close()

def create_pg_tables():
    """Create tables in the PostgreSQL database."""
    conn = psycopg2.connect(
        dbname=PG_DATABASE,
        user=PG_USER,
        password=PG_PASSWORD,
        host=PG_HOST,
        port=PG_PORT
    )
    cursor = conn.cursor()
    
    # Create tables
    queries = [
        '''
        CREATE TABLE IF NOT EXISTS Users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
            password_hash TEXT NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Owner', 'Member', 'Guest')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Households (
            household_id SERIAL PRIMARY KEY,
            household_name VARCHAR(100) UNIQUE NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Household_Users (
            household_user_id SERIAL PRIMARY KEY,
            household_id INTEGER NOT NULL REFERENCES Households(household_id),
            user_id INTEGER NOT NULL REFERENCES Users(user_id),
            role VARCHAR(20) DEFAULT 'member'
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Ingredient_Categories (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(100) UNIQUE NOT NULL
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Ingredients (
            ingredient_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category_id INTEGER REFERENCES Ingredient_Categories(category_id)
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Stores (
            store_id SERIAL PRIMARY KEY,
            store_name VARCHAR(100) NOT NULL,
            address TEXT NOT NULL,
            rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Ingredient_Prices (
            price_id SERIAL PRIMARY KEY,
            ingredient_id INTEGER NOT NULL REFERENCES Ingredients(ingredient_id),
            store_id INTEGER NOT NULL REFERENCES Stores(store_id),
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            unit VARCHAR(50) NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Household_Ingredients (
            household_ingredient_id SERIAL PRIMARY KEY,
            household_id INTEGER NOT NULL REFERENCES Households(household_id),
            ingredient_id INTEGER NOT NULL REFERENCES Ingredients(ingredient_id),
            quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
            unit VARCHAR(50) NOT NULL,
            expiration_date DATE CHECK (expiration_date > CURRENT_DATE),
            is_expired BOOLEAN DEFAULT FALSE
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Recipes (
            recipe_id SERIAL PRIMARY KEY,
            recipe_name VARCHAR(100) NOT NULL,
            cuisine VARCHAR(50),
            preparation_time INTEGER CHECK (preparation_time >= 0),
            system_rating DECIMAL(2,1) CHECK (system_rating >= 0 AND system_rating <= 5),
            is_rated BOOLEAN DEFAULT FALSE,
            expiration_date DATE CHECK (expiration_date > CURRENT_DATE),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Recipe_Ingredients (
            recipe_ingredient_id SERIAL PRIMARY KEY,
            recipe_id INTEGER NOT NULL REFERENCES Recipes(recipe_id),
            ingredient_id INTEGER NOT NULL REFERENCES Ingredients(ingredient_id),
            quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
            unit VARCHAR(50) NOT NULL
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS User_Recipe_History (
            history_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES Users(user_id),
            recipe_id INTEGER NOT NULL REFERENCES Recipes(recipe_id)
        )
        '''
    ]
    
    for query in queries:
        cursor.execute(query)
    
    # Commit changes and close connection
    conn.commit()
    cursor.close()
    conn.close()
    logger.info("PostgreSQL tables created successfully.")

def drop_and_create_mongo_collections():
    """Drop existing collections and create new ones in MongoDB."""
    client = pymongo.MongoClient(MONGO_URI)
    db = client[MONGO_DATABASE]
    
    # List of collections to manage
    collections = [
        'household_ingredient_usage',
        'ingredients',
        'recipe_ratings',
        'recipes',
        'user_preferences'
    ]
    
    # Drop existing collections
    for collection in collections:
        if collection in db.list_collection_names():
            db.drop_collection(collection)
            logger.info(f"MongoDB collection '{collection}' dropped successfully.")
    
    # Create new collections
    for collection in collections:
        db.create_collection(collection)
        logger.info(f"MongoDB collection '{collection}' created successfully.")
    
    client.close()

if __name__ == "__main__":
    drop_and_create_pg_db()
    create_pg_tables()
    drop_and_create_mongo_collections()
