import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
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

def drop_and_create_db():
    """Drop the database if it exists and create a new one."""
    client.drop_database(MONGO_DB)
    print(f"Database '{MONGO_DB}' dropped and recreated successfully.")

def create_collection_with_validator(collection_name, validator):
    """Create a collection with JSON schema validation."""
    db.create_collection(collection_name, validator={"$jsonSchema": validator})
    print(f"{collection_name} collection created.")

def create_collections():
    """Define and create MongoDB collections."""
    
    # Recipes Collection
    recipes_schema = {
        "bsonType": "object",
        "required": ["recipe_id", "recipe_name", "ingredients", "steps"],
        "properties": {
            "_id": {"bsonType": "objectId"},  # MongoDB's default ObjectId
            "recipe_id": {"bsonType": "int"},  # External ID, aligned with PostgreSQL
            "recipe_name": {"bsonType": "string"},
            "cuisine": {"bsonType": "string"},
            "preparation_time": {"bsonType": "int", "minimum": 0},
            "system_rating": {"bsonType": "double", "minimum": 0, "maximum": 5},
            "is_rated": {"bsonType": "bool"},
            "expiration_date": {"bsonType": "date"},
            "ingredients": {
                "bsonType": "array",
                "items": {
                    "bsonType": "object",
                    "required": ["ingredient_id", "name", "quantity", "unit"],
                    "properties": {
                        "ingredient_id": {"bsonType": "int"},  # External ID from PostgreSQL
                        "name": {"bsonType": "string"},
                        "quantity": {"bsonType": "double", "minimum": 0},
                        "unit": {"bsonType": "string"}
                    }
                }
            },
            "steps": {
                "bsonType": "array",
                "items": {"bsonType": "string"}
            },
            "images": {
                "bsonType": "array",
                "items": {"bsonType": "string"}
            },
            "video_url": {"bsonType": "string"},
            "ratings": {
                "bsonType": "array",
                "items": {
                    "bsonType": "object",
                    "properties": {
                        "user_id": {"bsonType": "int"},  # External ID from PostgreSQL
                        "rating": {"bsonType": "double", "minimum": 0, "maximum": 5},
                        "review": {"bsonType": "string"}
                    }
                }
            }
        }
    }
    create_collection_with_validator("Recipes", recipes_schema)

    # Ingredients Collection
    ingredients_schema = {
        "bsonType": "object",
        "required": ["ingredient_id", "name", "category", "unit", "value"],
        "properties": {
            "_id": {"bsonType": "objectId"},  # MongoDB's default ObjectId
            "ingredient_id": {"bsonType": "int"},  # External ID, aligned with PostgreSQL
            "name": {"bsonType": "string"},
            "category": {"bsonType": "string"},
            "unit": {"bsonType": "string"},
            "value": {"bsonType": "double", "minimum": 0},
            "image_url": {"bsonType": "string"},
            "nutritional_info": {
                "bsonType": "object",
                "properties": {
                    "calories": {"bsonType": "double"},
                    "protein": {"bsonType": "string"},
                    "fat": {"bsonType": "string"},
                    "carbohydrates": {"bsonType": "string"}
                }
            }
        }
    }
    create_collection_with_validator("Ingredients", ingredients_schema)

    # Household Ingredient Usage Collection
    usage_schema = {
        "bsonType": "object",
        "required": ["household_id", "ingredient_id", "used_quantity", "unit", "used_at"],
        "properties": {
            "_id": {"bsonType": "objectId"},  # MongoDB's default ObjectId
            "household_id": {"bsonType": "int"},  # External ID from PostgreSQL
            "ingredient_id": {"bsonType": "int"},  # External ID from PostgreSQL
            "used_quantity": {"bsonType": "double", "minimum": 0},
            "unit": {"bsonType": "string"},
            "used_at": {"bsonType": "date"}
        }
    }
    create_collection_with_validator("Household_Ingredient_Usage", usage_schema)

    # Recipe Ratings Collection
    ratings_schema = {
        "bsonType": "object",
        "required": ["rating_id", "user_id", "recipe_id", "rating"],
        "properties": {
            "_id": {"bsonType": "objectId"},  # MongoDB's default ObjectId
            "rating_id": {"bsonType": "int"},  # External ID, aligned with PostgreSQL
            "user_id": {"bsonType": "int"},  # External ID from PostgreSQL
            "recipe_id": {"bsonType": "int"},  # External ID from PostgreSQL
            "rating": {"bsonType": "double", "minimum": 0, "maximum": 5},
            "review": {"bsonType": "string"}
        }
    }
    create_collection_with_validator("Recipe_Ratings", ratings_schema)

    # User Preferences Collection
    preferences_schema = {
        "bsonType": "object",
        "required": ["user_id"],
        "properties": {
            "_id": {"bsonType": "objectId"},  # MongoDB's default ObjectId
            "user_id": {"bsonType": "int"},  # External ID, aligned with PostgreSQL
            "dietary_restrictions": {
                "bsonType": "array",
                "items": {"bsonType": "string"}
            },
            "preferred_cuisines": {
                "bsonType": "array",
                "items": {"bsonType": "string"}
            }
        }
    }
    create_collection_with_validator("User_Preferences", preferences_schema)

if __name__ == "__main__":
    drop_and_create_db()
    create_collections()
