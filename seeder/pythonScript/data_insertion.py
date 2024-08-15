import psycopg2
import json
import os
import csv
from pymongo import MongoClient
from dotenv import load_dotenv

class DataInsertion:
    """
    Manages data insertion into PostgreSQL and MongoDB databases.
    
    Methods:
        insert_sql_data() -> None:
            Inserts data into PostgreSQL from CSV files.
        insert_mongo_data() -> None:
            Inserts data into MongoDB from JSON files.
    """

    def __init__(self):
        """
        Initializes the DataInsertion class by loading environment variables and establishing database connections.
        """
        load_dotenv(override=True)
        self.sql_connection = self.connect_postgresql()
        self.mongo_client = self.connect_mongodb()
        self.mongo_db = self.mongo_client[os.getenv("MONGO_DB")]

    def connect_postgresql(self):
        """
        Establishes a connection to the PostgreSQL database.

        Returns:
            connection (psycopg2.extensions.connection): A connection to the PostgreSQL database.
        """
        try:
            connection = psycopg2.connect(
                dbname=os.getenv("POSTGRES_DB"),
                user=os.getenv("POSTGRES_USERNAME"),
                password=os.getenv("POSTGRES_PASSWORD"),
                host=os.getenv("POSTGRES_HOST"),
                port=os.getenv("POSTGRES_PORT")
            )
            connection.autocommit = True
            print("Connected to PostgreSQL database.")
            return connection
        except Exception as e:
            print(f"Error connecting to PostgreSQL: {e}")
            raise

    def connect_mongodb(self):
        """
        Establishes a connection to the MongoDB database.

        Returns:
            MongoClient: A client connected to the MongoDB database.
        """
        try:
            mongo_uri = os.getenv("MONGO_URI_TEMPLATE").format(
                username=os.getenv("MONGO_USERNAME"),
                password=os.getenv("MONGO_PASSWORD"),
                host=os.getenv("MONGO_HOST"),
                dbname=os.getenv("MONGO_DB")
            )
            client = MongoClient(mongo_uri)
            print("Connected to MongoDB.")
            return client
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise

    def insert_sql_data(self):
        """
        Inserts data into PostgreSQL from CSV files located in the ../csv directory.
        """
        csv_directory = '../csv'
        table_files = {
            "users": "Users.csv",
            "households": "Households.csv",
            "household_users": "Household_Users.csv",
            "ingredient_categories": "Ingredient_Categories.csv",
            "ingredients": "Ingredients.csv",
            "stores": "Stores.csv",
            "ingredient_prices": "Ingredient_Prices.csv",
            "household_ingredients": "Household_Ingredients.csv",
            "recipes": "Recipes.csv",
            "recipe_ingredients": "Recipe_Ingredients.csv",
            "user_recipe_history": "User_Recipe_History.csv",
            "user_ratings": "User_Ratings.csv"
        }

        for table, filename in table_files.items():
            file_path = os.path.join(csv_directory, filename)
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                continue

            with open(file_path, 'r') as file:
                reader = csv.reader(file)
                headers = next(reader)  # Skip the header row
                placeholders = ', '.join(['%s'] * len(headers))
                query = f"INSERT INTO {table} ({', '.join(headers)}) VALUES ({placeholders})"

                with self.sql_connection.cursor() as cursor:
                    for row in reader:
                        cursor.execute(query, row)
                    print(f"Inserted data into {table} from {filename}")

    def insert_mongo_data(self):
        """
        Inserts data into MongoDB from JSON files located in the ../json directory.
        """
        json_directory = '../json'
        collection_files = {
            "recipes_mongo": "recipes.json",
            "ingredients_mongo": "ingredients.json",
            "household_ingredient_usage": "household_ingredient_usage.json",
            "recipe_ratings": "recipe_ratings.json",
            "user_preferences": "user_preferences.json"
        }

        for collection_name, filename in collection_files.items():
            file_path = os.path.join(json_directory, filename)
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                continue

            with open(file_path, 'r') as file:
                data = json.load(file)
                collection = self.mongo_db[collection_name]
                if isinstance(data, list):
                    collection.insert_many(data)
                else:
                    collection.insert_one(data)
                print(f"Inserted data into {collection_name} from {filename}")

if __name__ == "__main__":
    data_inserter = DataInsertion()
    data_inserter.insert_sql_data()
    data_inserter.insert_mongo_data()
