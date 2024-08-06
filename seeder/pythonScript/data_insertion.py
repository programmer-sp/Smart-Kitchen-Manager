import psycopg2
import os
import pandas as pd
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection parameters
DATABASE = 'smart_kitchen_helper'
USER = 'postgres'
PASSWORD = 'root'
HOST = 'localhost'
PORT = '5432'

# Directory containing CSV files
CSV_DIR = '../csv'

def insert_data_from_csv(table_name):
    """Inserts data into the specified table from a CSV file."""
    csv_file = os.path.join(CSV_DIR, f'{table_name}.csv')
    
    if not os.path.exists(csv_file):
        logger.error(f"CSV file for table '{table_name}' not found.")
        return

    # Load CSV data into DataFrame
    df = pd.read_csv(csv_file)
    
    # Create a list of column names
    columns = df.columns.tolist()
    
    # Create SQL query for insertion
    columns_str = ', '.join(columns)
    placeholders = ', '.join(['%s'] * len(columns))
    query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
    
    try:
        # Connect to the database
        with psycopg2.connect(dbname=DATABASE, user=USER, password=PASSWORD, host=HOST, port=PORT) as conn:
            with conn.cursor() as cursor:
                # Execute insertion for each row
                for index, row in df.iterrows():
                    cursor.execute(query, tuple(row))
                conn.commit()
                logger.info(f"Data inserted into table '{table_name}' successfully.")
    except Exception as e:
        logger.error(f"Error inserting data into table '{table_name}': {e}")

def main():
    # List of tables to insert data into
    tables = [
        'Users',
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
    
    # Insert data into each table
    for table in tables:
        insert_data_from_csv(table)

if __name__ == '__main__':
    main()
