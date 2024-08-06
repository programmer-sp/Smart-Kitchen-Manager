# -*- coding: utf-8 -*-
"""
Created on Mon Aug  5 20:06:11 2024

@author: Amitr
"""

import psycopg2
import os
import pandas as pd

# Database connection parameters
DB_NAME = 'your_database'
DB_USER = 'postgres'
DB_PASSWORD = 'admin@1234'
DB_HOST = 'localhost'
DB_PORT = '5432'

# Directory containing CSV files
CSV_DIR = 'csv'

def insert_data_from_csv(table_name):
    """Inserts data into the specified table from a CSV file."""
    csv_file = os.path.join(CSV_DIR, f'{table_name}.csv')
    
    if not os.path.exists(csv_file):
        print(f"CSV file for table '{table_name}' not found.")
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
        with psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT) as conn:
            with conn.cursor() as cursor:
                # Execute insertion for each row
                for index, row in df.iterrows():
                    cursor.execute(query, tuple(row))
                conn.commit()
                print(f"Data inserted into table '{table_name}' successfully.")
    except Exception as e:
        print(f"Error inserting data into table '{table_name}': {e}")

def main():
    # List of tables to insert data into
    tables = [
        'users',
        'households',
        'household_users',
        'ingredient_categories',
        'ingredients',
        'stores',
        'ingredient_prices',
        'household_ingredients',
        'recipes',
        'recipe_ingredients',
        'user_recipe_history'
    ]
    
    # Insert data into each table
    for table in tables:
        insert_data_from_csv(table)

if __name__ == '__main__':
    main()
