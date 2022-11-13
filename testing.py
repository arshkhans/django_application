from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db_handle = client["DjangoWeb"]
cursor = db_handle["2022"]

data = cursor.find({})

length = len(list(data.clone()))
print(length)

# sort("bill_id",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)


limit = 2
page = 1
if page:
    try:
        skip = limit * int(page) - limit
    except:
        skip = 0
else:
    skip = 0

for i in data.clone().sort([("bill_id",1),("$text", {"$search": "2022"})]).collation({"locale":"en_US", "numericOrdering": True}):
    print(i["bill_id"])
page = 2
if page:
    try:
        skip = limit * int(page) - limit
    except:
        skip = 0
else:
    skip = 0

for i in data.clone().sort("bill_id",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit):
    print(i["bill_id"])

