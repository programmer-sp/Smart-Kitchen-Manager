# -*- coding: utf-8 -*-
"""
Created on Thu Aug 15 18:29:01 2024

@author: Amitr
"""

import logging
from aws_setup import AWSSetup
from postgresql_setup import PostgreSQLSetup
from mongodb_setup import MongoDBSetup
from data_insertion import DataInsertion
from youtube_image_fetch import YouTubeImageFetcher
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(override=True)

# Set up logging
logging.basicConfig(
    filename='log.txt',
    level=logging.INFO,
    format='%(asctime)s:%(levelname)s:%(message)s'
)

def main():
    logging.info("Starting Smart Kitchen Helper setup...")

    try:
        # AWS Setup
        logging.info("Starting AWS setup...")
        aws_setup = AWSSetup()
        aws_setup.run_setup()
        logging.info("AWS setup completed.")

        # PostgreSQL Setup
        logging.info("Starting PostgreSQL setup...")
        postgres_setup = PostgreSQLSetup()
        postgres_setup.run_setup()
        logging.info("PostgreSQL setup completed.")

        # MongoDB Setup
        logging.info("Starting MongoDB setup...")
        mongo_setup = MongoDBSetup()
        mongo_setup.create_collections()
        logging.info("MongoDB setup completed.")

        # Data Insertion
        logging.info("Starting data insertion...")
        data_inserter = DataInsertion()
        data_inserter.insert_sql_data()
        data_inserter.insert_mongo_data()
        logging.info("Data insertion completed.")

        # YouTube and Unsplash Fetch
        logging.info("Starting YouTube and Unsplash fetch...")
        fetcher = YouTubeImageFetcher()
        fetcher.fetch_youtube_urls()
        fetcher.fetch_image_urls()
        logging.info("YouTube and Unsplash fetch completed.")

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise

    logging.info("Smart Kitchen Helper setup completed successfully.")

if __name__ == "__main__":
    main()
