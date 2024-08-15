# -*- coding: utf-8 -*-
"""
Created on Thu Aug 15 18:26:56 2024

@author: Amitr
"""

import os
import requests
from googleapiclient.discovery import build
from pymongo import MongoClient
from dotenv import load_dotenv

class YouTubeImageFetcher:
    """
    Manages the fetching and updating of YouTube video URLs and Unsplash image URLs in MongoDB collections.
    
    Methods:
        connect_mongodb() -> MongoClient:
            Establishes a connection to the MongoDB database.
        fetch_youtube_urls() -> None:
            Fetches YouTube video URLs using the YouTube API and updates the MongoDB recipes collection.
        fetch_image_urls() -> None:
            Fetches image URLs from Unsplash API and updates the MongoDB ingredients collection.
        update_collection(collection_name: str, filter: dict, update: dict) -> None:
            Updates a MongoDB collection with the given filter and update parameters.
    """

    def __init__(self):
        """
        Initializes the YouTubeImageFetcher class by loading environment variables and connecting to MongoDB.
        """
        load_dotenv(override=True)
        self.mongo_client = self.connect_mongodb()
        self.mongo_db = self.mongo_client[os.getenv("MONGO_DB")]
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        self.unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY")

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

    def fetch_youtube_urls(self):
        """
        Fetches YouTube video URLs using the YouTube API and updates the MongoDB recipes collection.
        """
        youtube = build('youtube', 'v3', developerKey=self.youtube_api_key)
        recipes_collection = self.mongo_db['recipes_mongo']

        recipes = recipes_collection.find({"video_url": {"$exists": False}})
        for recipe in recipes:
            query = recipe["recipe_name"] + " recipe"
            request = youtube.search().list(q=query, part="snippet", type="video", maxResults=1)
            response = request.execute()

            if response["items"]:
                video_url = "https://www.youtube.com/watch?v=" + response["items"][0]["id"]["videoId"]
                self.update_collection(
                    "recipes_mongo",
                    {"_id": recipe["_id"]},
                    {"$set": {"video_url": video_url}}
                )
                print(f"Updated recipe '{recipe['recipe_name']}' with YouTube URL: {video_url}")

    def fetch_image_urls(self):
        """
        Fetches image URLs from Unsplash API and updates the MongoDB ingredients collection.
        """
        ingredients_collection = self.mongo_db['ingredients_mongo']

        ingredients = ingredients_collection.find({"image_url": {"$exists": False}})
        for ingredient in ingredients:
            query = ingredient["name"]
            image_url = self.search_unsplash(query)
            if image_url:
                self.update_collection(
                    "ingredients_mongo",
                    {"_id": ingredient["_id"]},
                    {"$set": {"image_url": image_url}}
                )
                print(f"Updated ingredient '{ingredient['name']}' with image URL: {image_url}")

    def search_unsplash(self, query):
        """
        Searches Unsplash for an image matching the query and returns the image URL.

        Args:
            query (str): The search query for Unsplash.

        Returns:
            str: The URL of the first image result from Unsplash, or None if not found.
        """
        url = f"https://api.unsplash.com/search/photos?query={query}&client_id={self.unsplash_access_key}&per_page=1"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            if data['results']:
                return data['results'][0]['urls']['regular']
            else:
                print(f"No images found for query: {query}")
                return None
        else:
            print(f"Error fetching image from Unsplash: {response.status_code}")
            return None

    def update_collection(self, collection_name, filter, update):
        """
        Updates a MongoDB collection with the given filter and update parameters.

        Args:
            collection_name (str): The name of the MongoDB collection to update.
            filter (dict): The filter criteria for the documents to update.
            update (dict): The update operations to apply to the documents.
        """
        collection = self.mongo_db[collection_name]
        collection.update_one(filter, update)
        print(f"Updated collection '{collection_name}' with filter: {filter} and update: {update}")

if __name__ == "__main__":
    fetcher = YouTubeImageFetcher()
    fetcher.fetch_youtube_urls()
    fetcher.fetch_image_urls()
