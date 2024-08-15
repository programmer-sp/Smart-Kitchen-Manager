# -*- coding: utf-8 -*-
"""
Created on Sun Aug 11 15:24:57 2024

@author: Amitr
"""

import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
import urllib.parse
import json

# Load environment variables from .env file
load_dotenv(override=True)

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

# Fetch YouTube API key from the environment
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Function to search YouTube and get the most-watched and highest-rated video URL
def get_best_youtube_video(recipe_name):
    search_url = "https://www.googleapis.com/youtube/v3/search"
    video_url = "https://www.googleapis.com/youtube/v3/videos"

    # Search for the recipe name
    search_params = {
        "part": "snippet",
        "q": 'Preparation Video of Recipie ' + recipe_name,
        "type": "video",
        "key": YOUTUBE_API_KEY,
        "maxResults": 5,
        "order": "viewCount"
    }

    response = requests.get(search_url, params=search_params)
    search_results = response.json()

    if "items" not in search_results:
        print(f"Error fetching YouTube search results for recipe: {recipe_name}")
        return None

    # Get video IDs
    video_ids = [item["id"]["videoId"] for item in search_results["items"]]

    # Get statistics for each video
    video_params = {
        "part": "statistics",
        "id": ",".join(video_ids),
        "key": YOUTUBE_API_KEY
    }

    response = requests.get(video_url, params=video_params)
    video_results = response.json()

    if "items" not in video_results:
        print(f"Error fetching YouTube video details for recipe: {recipe_name}")
        return None

    # Find the video with the highest view count
    best_video = max(video_results["items"], key=lambda x: int(x["statistics"]["viewCount"]))

    video_id = best_video["id"]
    return f"https://www.youtube.com/watch?v={video_id}"

# Function to update all recipes in the MongoDB collection with the YouTube video URLs
def update_all_recipes_in_mongo():
    recipes = db.recipes.find()

    for recipe in recipes:
        recipe_name = recipe["recipe_name"]
        best_video_url = get_best_youtube_video(recipe_name)
        if best_video_url:
            db.recipes.update_one(
                {"_id": recipe["_id"]},
                {"$set": {"video_url": best_video_url}}
            )
            print(f"Updated {recipe_name} with video URL: {best_video_url}")
        else:
            print(f"No video found for {recipe_name}")

# Function to update all recipes in the JSON with the YouTube video URLs
def update_all_recipes_with_videos(json_file):
    with open(json_file, "r") as file:
        recipes = json.load(file)

    for recipe in recipes:
        recipe_name = recipe["recipe_name"]
        best_video_url = get_best_youtube_video(recipe_name)
        if best_video_url:
            recipe["video_url"] = best_video_url
            print(f"Updated {recipe_name} with video URL: {best_video_url}")
        else:
            print(f"No video found for {recipe_name}")

    # Write the updated recipes back to the JSON file
    with open(json_file, "w") as file:
        json.dump(recipes, file, indent=4)


if __name__ == "__main__":
    update_all_recipes_with_videos(json_file)
    # update_all_recipes_in_mongo()
