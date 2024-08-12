# -*- coding: utf-8 -*-
"""
Created on Mon Aug 12 14:30:31 2024

@author: Amitr
"""

import os
import pandas as pd
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
import urllib.parse

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

# Function to seed tables from CSV files
def seed_tables_from_csv(conn_string, csv_directory):
    # Establish the database connection
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()

    try:
        # Get the list of CSV files in the directory
        csv_files = [f for f in os.listdir(csv_directory) if f.endswith('.csv')]

        for csv_file in csv_files:
            # Extract the table name from the CSV file name and convert to lowercase
            table_name = os.path.splitext(csv_file)[0].lower()

            # Read the CSV file into a DataFrame
            csv_path = os.path.join(csv_directory, csv_file)
            df = pd.read_csv(csv_path)

            # Insert the data into the table
            columns = df.columns.tolist()
            insert_query = sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
                sql.Identifier(table_name),
                sql.SQL(', ').join(map(sql.Identifier, columns)),
                sql.SQL(', ').join(sql.Placeholder() * len(columns))
            )

            for row in df.itertuples(index=False, name=None):
                try:
                    print(f"Inserting into {table_name}: {row}")  # Print the row being inserted
                    cursor.execute(insert_query, row)
                    conn.commit()  # Commit each successful insertion
                except Exception as e:
                    # Print the error and the row that caused it
                    print(f"Error inserting row {row} into {table_name}: {e}")
                    conn.rollback()  # Rollback the transaction to the previous state

            print(f"Data insertion completed for table '{table_name}'.")

            # Fetch and print the first 5 records from the table
            select_query = sql.SQL("SELECT * FROM {} LIMIT 5").format(sql.Identifier(table_name))
            cursor.execute(select_query)
            records = cursor.fetchall()
            df_records = pd.DataFrame(records, columns=columns)
            print(f"First 5 records from '{table_name}':\n", df_records)

    except Exception as e:
        print(f"An error occurred while seeding tables: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    # Define the path to the CSV directory
    csv_directory = './csv/'

    # Seed the tables with data from the CSV files
    seed_tables_from_csv(conn_string, csv_directory)
