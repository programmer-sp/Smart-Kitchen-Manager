import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
import urllib.parse

# Load environment variables from .env file
load_dotenv(override=True)

# Fetch MongoDB credentials from the environment
MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_DB = os.getenv("MONGO_DB")

# Fetch the MongoDB URI template
MONGO_URI_TEMPLATE = os.getenv("MONGO_URI_TEMPLATE")

# URL encode the password to handle special characters
encoded_password = urllib.parse.quote_plus(MONGO_PASSWORD)

# Construct the MongoDB connection string using the template
mongo_uri = MONGO_URI_TEMPLATE.format(
    username=MONGO_USERNAME,
    password=encoded_password,
    host=MONGO_HOST,
    dbname=MONGO_DB
)

print(f"MongoDB Connection String: {mongo_uri}")

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client[MONGO_DB]

def insert_json_files_into_collections(json_directory):
    """Insert JSON data from files into MongoDB collections."""
    try:
        # Get the list of JSON files in the directory
        json_files = [f for f in os.listdir(json_directory) if f.endswith('.json')]

        for json_file in json_files:
            collection_name = os.path.splitext(json_file)[0]
            json_path = os.path.join(json_directory, json_file)
            
            # Check if the file is empty
            if os.stat(json_path).st_size == 0:
                print(f"File '{json_file}' is empty and will be skipped.")
                continue

            try:
                with open(json_path, 'r') as file:
                    # Attempt to load JSON data
                    data = json.load(file)

                    if isinstance(data, list):
                        # If the data is a list of documents
                        db[collection_name].insert_many(data)
                        print(f"Inserted {len(data)} documents into collection '{collection_name}'.")
                    else:
                        # If the data is a single document
                        db[collection_name].insert_one(data)
                        print(f"Inserted 1 document into collection '{collection_name}'.")
            
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON in file '{json_file}': {e}")

    except Exception as e:
        print(f"An error occurred while inserting data: {e}")

if __name__ == "__main__":
    # Define the path to the JSON directory
    json_directory = './csv/'

    # Insert JSON data into MongoDB collections
    insert_json_files_into_collections(json_directory)
