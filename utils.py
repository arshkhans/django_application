from pymongo import MongoClient

def get_db_cursor(db_name, collection_name):
    client = MongoClient("mongodb://localhost:27017")
    db_handle = client[db_name]
    cursor = db_handle[collection_name]
    return cursor