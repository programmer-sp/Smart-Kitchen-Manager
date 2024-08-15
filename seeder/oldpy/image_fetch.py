import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
import urllib.parse
import json
from google_images_search import GoogleImagesSearch
import time
from googleapiclient.errors import HttpError

# Load environment variables from .env file
load_dotenv(override=True)

# Fetch Unsplash Access Key from the environment
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

# Fetch Google Custom Search credentials from the environment
GOOGLE_PROJECT_CX = os.getenv("GOOGLE_PROJECT_CX")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Fetch MongoDB credentials from the environment
MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_DB = os.getenv("MONGO_DB")
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

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client[MONGO_DB]

# Initialize Google Images Search client
gis = GoogleImagesSearch(GOOGLE_API_KEY, GOOGLE_PROJECT_CX)

# Global flag for Google quota
google_quota_exceeded = False

def get_unsplash_image(ingredient_name, page=1, per_page=1, orientation='squarish', order_by='relevant', color=None):
    """
    Fetches an image URL from Unsplash based on the search query.
    """
    search_url = "https://api.unsplash.com/search/photos"
    search_params = {
        "query": ingredient_name,
        "client_id": UNSPLASH_ACCESS_KEY,
        "page": page,
        "per_page": per_page,
        "orientation": orientation,
        "order_by": order_by,
    }
    if color:
        search_params["color"] = color
    response = requests.get(search_url, params=search_params)
    if response.status_code != 200:
        print(f"Error fetching image from Unsplash: {response.status_code}")
        return None
    search_results = response.json()
    if "results" in search_results and len(search_results["results"]) > 0:
        return search_results["results"][0]["urls"]["regular"]
    else:
        print(f"No images found for query: {ingredient_name}")
        return None

def get_google_image(ingredient_name, img_size='medium', safe='off'):
    """
    Fetches an image URL from Google Custom Search based on the search query.
    Handles quota errors by setting a global flag when the quota is exceeded.
    
    :param ingredient_name: The search term (e.g., ingredient name) for fetching the image.
    :param img_size: Restrict to images of a specific size. Valid values: 'icon', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'huge'.
    :param safe: Safe search level. Valid values: 'off', 'medium', 'high'.
    :return: URL of the best matching image or None if no image is found or quota is exceeded.
    """
    global google_quota_exceeded

    if google_quota_exceeded:
        print("Google API quota exceeded. Skipping Google Custom Search.")
        return None

    search_url = "https://www.googleapis.com/customsearch/v1"
    search_params = {
        "q": ingredient_name,
        "cx": GOOGLE_PROJECT_CX,
        "key": GOOGLE_API_KEY,
        "num": 1,
        "imgSize": img_size,
        "safe": safe
    }

    try:
        response = requests.get(search_url, params=search_params)
        response.raise_for_status()
        search_results = response.json()
        if "items" in search_results and len(search_results["items"]) > 0:
            return search_results["items"][0]["link"]
        else:
            print(f"No images found on Google for query: {ingredient_name}")
            return None
    except HttpError as e:
        if e.resp.status == 429:
            print("Quota exceeded for Google Custom Search API.")
            google_quota_exceeded = True  # Set the global flag
        else:
            print(f"Error fetching image from Google: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

    return None

def get_best_image_url(ingredient_name):
    """
    Attempts to fetch the best image URL using Unsplash first, then Google Custom Search, and finally Google Images Search.
    """
    image_url = get_unsplash_image(ingredient_name)
    if not image_url:
        image_url = get_google_image(ingredient_name)
    return image_url

def update_image_url(entry, update_function):
    """
    Updates the image URL for a given entry if it doesn't already exist.
    """
    if "image_url" in entry and ("unsplash" in entry["image_url"].lower() or "google" in entry["image_url"].lower()):
        print(f"Skipping {entry['name']} as it already has an image URL.")
        return
    ingredient_name = entry["name"]
    image_url = get_best_image_url(ingredient_name)
    if image_url:
        update_function(entry, image_url)
        print(f"Updated {ingredient_name} with image URL: {image_url}")
    else:
        print(f"No image found for {ingredient_name}")

def update_mongo_with_image_urls():
    """
    Update MongoDB 'ingredients' collection with image URLs.
    """
    ingredients = db.ingredients.find()
    def mongo_update_function(entry, image_url):
        db.ingredients.update_one(
            {"_id": entry["_id"]},
            {"$set": {"image_url": image_url}}
        )
    for ingredient in ingredients:
        update_image_url(ingredient, mongo_update_function)

def update_json_with_image_urls(json_file):
    """
    Update the local JSON file with image URLs.
    """
    with open(json_file, "r") as file:
        ingredients = json.load(file)
    def json_update_function(entry, image_url):
        entry["image_url"] = image_url
    for ingredient in ingredients:
        update_image_url(ingredient, json_update_function)
    with open(json_file, "w") as file:
        json.dump(ingredients, file, indent=4)

if __name__ == "__main__":
    # Example: Update MongoDB collection
    # update_mongo_with_image_urls()

    # Example: Update a local JSON file
    json_file = ".\\csv\\ingredients.json"
    update_json_with_image_urls(json_file)
