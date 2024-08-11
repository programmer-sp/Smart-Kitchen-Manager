import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import sql
import urllib.parse

# # Get the absolute path of the current file
# current_file_path = os.path.abspath(__file__)
# print(f"Current file path: {current_file_path}")

# # Get the directory of the current file
# current_directory = os.path.dirname(current_file_path)
# print(f"Current directory: {current_directory}")

# # Change the working directory to the directory of the current file
# os.chdir(current_directory)
# print(f"Changed working directory to: {os.getcwd()}")

# Load environment variables from .env file
load_dotenv(override=True)

# Fetch PostgreSQL credentials from the environment
POSTGRES_USERNAME = os.getenv("POSTGRES_USERNAME")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")

# Fetch the PostgreSQL URI template
POSTGRES_URI_TEMPLATE = os.getenv("POSTGRES_URI_TEMPLATE")

# URL encode the password to handle special characters
encoded_password = urllib.parse.quote_plus(POSTGRES_PASSWORD)

# Construct the PostgreSQL connection string using the template
conn_string = POSTGRES_URI_TEMPLATE.format(
    username=POSTGRES_USERNAME,
    password=encoded_password,
    host=POSTGRES_HOST,
    port=POSTGRES_PORT,
    dbname=POSTGRES_DB
)

print(f"PostgreSQL Connection String: {conn_string}")

def drop_and_create_db(conn_string):
    """Drop the database if it exists and create a new one."""
    default_conn_string = conn_string.replace(f"/{POSTGRES_DB}", "/postgres")
    conn = psycopg2.connect(default_conn_string)
    conn.autocommit = True
    cursor = conn.cursor()

    try:
        cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(POSTGRES_DB)))
        print(f"Database '{POSTGRES_DB}' dropped successfully.")

        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(POSTGRES_DB)))
        print(f"Database '{POSTGRES_DB}' created successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        cursor.close()
        conn.close()

def create_tables(conn_string):
    """Create tables in the PostgreSQL database."""
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()

    # Create a trigger function to automatically update the 'updated_at' timestamp
    trigger_function = '''
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    '''

    # Execute the trigger function creation
    cursor.execute(trigger_function)

    queries = [
        '''
        CREATE TABLE IF NOT EXISTS Addresses (
            address_id SERIAL PRIMARY KEY,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            postal_code VARCHAR(20)
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('Guest', 'Member', 'Owner', 'Moderator', 'Administrator', 'Content Creator', 'Viewer')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT FALSE
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Households (
            household_id SERIAL PRIMARY KEY,
            household_name VARCHAR(100) UNIQUE NOT NULL,
            address_id INTEGER REFERENCES Addresses(address_id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT FALSE
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Household_Users (
            household_user_id SERIAL PRIMARY KEY,
            household_id INTEGER NOT NULL REFERENCES Households(household_id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            role VARCHAR(20) DEFAULT 'Member' CHECK (role IN ('Member', 'Owner'))
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Ingredient_Categories (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(50) UNIQUE NOT NULL,
            parent_category_id INTEGER REFERENCES Ingredient_Categories(category_id) ON DELETE SET NULL
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Ingredients (
            ingredient_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category_id INTEGER REFERENCES Ingredient_Categories(category_id) ON DELETE SET NULL
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Stores (
            store_id SERIAL PRIMARY KEY,
            store_name VARCHAR(100) NOT NULL,
            address_id INTEGER REFERENCES Addresses(address_id) ON DELETE SET NULL,
            rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Ingredient_Prices (
            price_id SERIAL PRIMARY KEY,
            ingredient_id INTEGER NOT NULL REFERENCES Ingredients(ingredient_id) ON DELETE CASCADE,
            store_id INTEGER NOT NULL REFERENCES Stores(store_id) ON DELETE CASCADE,
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            unit VARCHAR(50) NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Household_Ingredients (
            household_ingredient_id SERIAL PRIMARY KEY,
            household_id INTEGER NOT NULL REFERENCES Households(household_id) ON DELETE CASCADE,
            ingredient_id INTEGER NOT NULL REFERENCES Ingredients(ingredient_id) ON DELETE CASCADE,
            quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
            unit VARCHAR(50) NOT NULL,
            expiration_date DATE CHECK (expiration_date > CURRENT_DATE),
            is_expired BOOLEAN DEFAULT FALSE
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Recipes (
            recipe_id SERIAL PRIMARY KEY,
            recipe_name VARCHAR(100) NOT NULL,
            cuisine VARCHAR(50),
            preparation_time INTEGER CHECK (preparation_time >= 0),
            system_rating DECIMAL(2,1) CHECK (system_rating >= 0 AND system_rating <= 5),
            is_rated BOOLEAN DEFAULT FALSE,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'seasonal')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Recipe_Ingredients (
            recipe_ingredient_id SERIAL PRIMARY KEY,
            recipe_id INTEGER NOT NULL REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
            ingredient_id INTEGER NOT NULL REFERENCES Ingredients(ingredient_id) ON DELETE CASCADE,
            quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
            unit VARCHAR(50) NOT NULL
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Recipe_Tags (
            recipe_tag_id SERIAL PRIMARY KEY,
            recipe_id INTEGER REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
            tag VARCHAR(50) NOT NULL
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS User_Recipe_History (
            history_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            recipe_id INTEGER NOT NULL REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
            cooked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS User_Ratings (
            rating_id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            recipe_id INTEGER NOT NULL REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
            rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Action_Logs (
            log_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(user_id),
            action VARCHAR(255) NOT NULL,
            description TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Permissions (
            permission_id SERIAL PRIMARY KEY,
            role VARCHAR(20) NOT NULL,
            permission_name VARCHAR(50) NOT NULL,
            allowed BOOLEAN DEFAULT TRUE
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Role_Permissions (
            role_permission_id SERIAL PRIMARY KEY,
            role VARCHAR(20) NOT NULL,
            permission_id INTEGER REFERENCES Permissions(permission_id) ON DELETE CASCADE
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS User_Security (
            user_security_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(user_id),
            mfa_enabled BOOLEAN DEFAULT FALSE,
            mfa_token VARCHAR(255)
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS Password_History (
            history_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(user_id),
            password_hash VARCHAR(255) NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        '''
    ]

    try:
        for query in queries:
            cursor.execute(query)
        conn.commit()
        print("Tables created successfully.")

        # Apply the trigger to tables with 'updated_at'
        cursor.execute('''
            CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON Users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ''')

        cursor.execute('''
            CREATE TRIGGER update_households_updated_at
            BEFORE UPDATE ON Households
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ''')
    except Exception as e:
        print(f"An error occurred while creating tables: {e}")
    finally:
        cursor.close()
        conn.close()

def create_indexes(conn_string):
    """Create indexes on the PostgreSQL database."""
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()

    indexes = [
        'CREATE INDEX idx_recipe_ingredient ON Recipe_Ingredients(recipe_id, ingredient_id);',
        'CREATE INDEX idx_recipe_name ON Recipes USING GIN (to_tsvector(\'english\', recipe_name));',
        'CREATE INDEX idx_household_user ON Household_Users(household_id, user_id);',
        'CREATE INDEX idx_store_rating ON Stores(rating);',
    ]

    try:
        for index in indexes:
            cursor.execute(index)
        conn.commit()
        print("Indexes created successfully.")
    except Exception as e:
        print(f"An error occurred while creating indexes: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    drop_and_create_db(conn_string)
    create_tables(conn_string)
    create_indexes(conn_string)