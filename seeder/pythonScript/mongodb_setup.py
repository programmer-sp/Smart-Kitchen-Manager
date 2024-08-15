from pymongo import MongoClient
from dotenv import load_dotenv
import os

class MongoDBSetup:
    """
    Manages MongoDB database setup, including dropping the database if it exists and creating collections.
    
    Methods:
        connect() -> pymongo.MongoClient:
            Establishes a connection to the MongoDB database.
        setup_database() -> None:
            Drops the existing database and creates the necessary collections.
        create_collections() -> None:
            Creates the necessary collections in the MongoDB database.
    """

    def __init__(self):
        """
        Initializes the MongoDBSetup class by loading environment variables and connecting to the database.
        """
        load_dotenv(override=True)
        self.client = self.connect()
        self.db_name = os.getenv("MONGO_DB")
        self.db = self.client[self.db_name]
        self.setup_database()

    def connect(self):
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

    def setup_database(self):
        """
        Drops the existing MongoDB database and creates a fresh one.
        """
        if self.db_name in self.client.list_database_names():
            self.client.drop_database(self.db_name)
            print(f"Dropped existing database: {self.db_name}")
        self.db = self.client[self.db_name]
        print(f"Created new database: {self.db_name}")
        self.create_collections()

    def create_collections(self):
        """
        Creates the necessary collections in the MongoDB database.
        """
        collections = {
            "recipes_mongo": {
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["recipe_name", "ingredients", "steps"],
                        "properties": {
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
                                        "ingredient_id": {"bsonType": "objectId"},
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
                                    "required": ["user_id", "rating"],
                                    "properties": {
                                        "user_id": {"bsonType": "objectId"},
                                        "rating": {"bsonType": "double", "minimum": 0, "maximum": 5},
                                        "review": {"bsonType": "string"}
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "ingredients_mongo": {
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["name", "category", "unit", "value"],
                        "properties": {
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
                }
            },
            "household_ingredient_usage": {
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["household_id", "ingredient_id", "used_quantity", "unit", "used_at"],
                        "properties": {
                            "household_id": {"bsonType": "objectId"},
                            "ingredient_id": {"bsonType": "objectId"},
                            "used_quantity": {"bsonType": "double", "minimum": 0},
                            "unit": {"bsonType": "string"},
                            "used_at": {"bsonType": "date"}
                        }
                    }
                }
            },
            "recipe_ratings": {
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["user_id", "recipe_id", "rating"],
                        "properties": {
                            "user_id": {"bsonType": "objectId"},
                            "recipe_id": {"bsonType": "objectId"},
                            "rating": {"bsonType": "double", "minimum": 0, "maximum": 5},
                            "review": {"bsonType": "string"}
                        }
                    }
                }
            },
            "user_preferences": {
                "validator": {
                    "$jsonSchema": {
                        "bsonType": "object",
                        "required": ["user_id"],
                        "properties": {
                            "user_id": {"bsonType": "objectId"},
                            "dietary_restrictions": {"bsonType": "array", "items": {"bsonType": "string"}},
                            "preferred_cuisines": {"bsonType": "array", "items": {"bsonType": "string"}}
                        }
                    }
                }
            }
        }

        for collection_name, options in collections.items():
            self.db.create_collection(collection_name, **options)
            print(f"Created collection: {collection_name} with validation schema.")

if __name__ == "__main__":
    mongo_setup = MongoDBSetup()
    mongo_setup.create_collections()
