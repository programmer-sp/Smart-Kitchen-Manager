import psycopg2
import pymongo
import os
import pandas as pd
import json
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

# Directories for CSV and JSON files
CSV_DIR = '../csv'
JSON_DIR = '../json'

def insert_data_from_csv(table_name):
    """Inserts data into the specified table from a CSV file."""
    csv_file = os.path.join(CSV_DIR, f'{table_name}.csv')
    
    if not os.path.exists(csv_file):
        logger.error(f"CSV file for table '{table_name}' not found.")
        return

    df = pd.read_csv(csv_file)
    
    columns = df.columns.tolist()
    columns_str = ', '.join(columns)
    placeholders = ', '.join(['%s'] * len(columns))
    query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
    
    try:
        with psycopg2.connect(dbname=PG_DATABASE, user=PG_USER, password=PG_PASSWORD, host=PG_HOST, port=PG_PORT) as conn:
            with conn.cursor() as cursor:
                for index, row in df.iterrows():
                    try:
                        cursor.execute(query, tuple(row))
                    except psycopg2.IntegrityError as e:
                        logger.error(f"Integrity error inserting into table '{table_name}': {e}")
                        conn.rollback()
                    except Exception as e:
                        logger.error(f"Error inserting data into table '{table_name}': {e}")
                        conn.rollback()
                conn.commit()
                logger.info(f"Data inserted into table '{table_name}' successfully.")
    except Exception as e:
        logger.error(f"Error connecting to PostgreSQL: {e}")

def update_json_with_pg_data():
    """Updates JSON files with new values from PostgreSQL."""
    id_map = {}

    try:
        with psycopg2.connect(dbname=PG_DATABASE, user=PG_USER, password=PG_PASSWORD, host=PG_HOST, port=PG_PORT) as conn:
            with conn.cursor() as cursor:
                # Example for Household data
                cursor.execute("SELECT household_id, household_name FROM households")
                id_map['Households'] = {household_name: household_id for household_id, household_name in cursor.fetchall()}
                
                cursor.execute("SELECT ingredient_id, name FROM ingredients")
                id_map['Ingredients'] = {name: ingredient_id for ingredient_id, name in cursor.fetchall()}
                
                # Update JSON files
                update_json_file('household_ingredient_usage', id_map)
                update_json_file('recipe_ingredients', id_map)
                update_json_file('recipe_ratings', id_map)
                update_json_file('user_preferences', id_map)
                
    except Exception as e:
        logger.error(f"Error updating JSON with PostgreSQL data: {e}")

def update_json_file(collection_name, id_map):
    """Update JSON data with IDs from PostgreSQL."""
    json_file = os.path.join(JSON_DIR, f'{collection_name}.json')
    
    if not os.path.exists(json_file):
        logger.error(f"JSON file for collection '{collection_name}' not found.")
        return

    with open(json_file, 'r') as file:
        data = json.load(file)
    
    updated_data = []
    
    for item in data:
        if 'household_name' in item:
            household_name = item['household_name']
            if household_name in id_map['Households']:
                item['household_id'] = id_map['Households'][household_name]
            else:
                logger.warning(f"Missing 'household_name' in item: {item}")
        
        if 'ingredient_name' in item:
            ingredient_name = item['ingredient_name']
            if ingredient_name in id_map['Ingredients']:
                item['ingredient_id'] = id_map['Ingredients'][ingredient_name]
            else:
                logger.warning(f"Missing 'ingredient_name' in item: {item}")
        
        updated_data.append(item)
    
    with open(json_file, 'w') as file:
        json.dump(updated_data, file, indent=4)
    
    logger.info(f"Updated JSON file '{json_file}' with new values.")

def insert_data_from_json(collection_name):
    """Inserts data into the specified MongoDB collection from a JSON file."""
    json_file = os.path.join(JSON_DIR, f'{collection_name}.json')
    
    if not os.path.exists(json_file):
        logger.error(f"JSON file for collection '{collection_name}' not found.")
        return

    with open(json_file, 'r') as file:
        data = json.load(file)
    
    client = pymongo.MongoClient(MONGO_URI)
    db = client[MONGO_DATABASE]
    
    try:
        if isinstance(data, list):
            db[collection_name].insert_many(data)
        else:
            db[collection_name].insert_one(data)
        logger.info(f"Data inserted into collection '{collection_name}' successfully.")
    except Exception as e:
        logger.error(f"Error inserting data into collection '{collection_name}': {e}")
    finally:
        client.close()

def main():
    # Insert data into Users table first
    insert_data_from_csv('Users')
    
    # Insert data into remaining tables
    tables = [
        'Households',
        'Household_Users',
        'Ingredient_Categories',
        'Ingredients',
        'Stores',
        'Ingredient_Prices',
        'Household_Ingredients',
        'Recipes',
        'Recipe_Ingredients',
        'User_Recipe_History'
    ]
    
    for table in tables:
        insert_data_from_csv(table)
    
    update_json_with_pg_data()
    
    collections = [
        'household_ingredient_usage',
        'ingredients',
        'recipe_ratings',
        'recipes',
        'user_preferences'
    ]
    
    for collection in collections:
        insert_data_from_json(collection)

if __name__ == '__main__':
    main()
