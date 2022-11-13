from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from utils import get_db_cursor
from rest_framework.exceptions import APIException
import json

def test(request):
    return render(request, 'test.html')

def orders(request):
    cursor = get_db_cursor("DjangoWeb","2022")

    limit = 10

    if page:= request.GET.get('page', ''):
        try:
            skip = limit * int(page) - limit
        except:
            skip = 0
    else:
        skip = 0
    
    if search:= request.GET.get('search', ''):
        searchFlag = True
    else:
        searchFlag = False
    
    if searchFlag:
        length = cursor.count_documents({"$text": {"$search": search}})
    else:
        length = cursor.count_documents({})

    if bill:= request.GET.get('bill', ''):
        if searchFlag:
            if bill == "asc":
                data = cursor.find({"$text": {"$search": search}}).sort("bill_id",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)
            elif bill == "des":
                data = cursor.find({"$text": {"$search": search}}).sort("bill_id",-1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)

        else:
            if bill == "asc":
                data = cursor.find({}).sort("bill_id",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)
            elif bill == "des":
                data = cursor.find({}).sort("bill_id",-1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)

    elif order:= request.GET.get('order', ''):
        if searchFlag:
            if order == "asc":
                data = cursor.find({"$text": {"$search": search}}).sort("order_id",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)
            elif order == "des":
                data = cursor.find({"$text": {"$search": search}}).sort("order_id",-1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)

        else:
            if order == "asc":
                data = cursor.find({}).sort("order_id",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)
            elif order == "des":
                data = cursor.find({}).sort("order_id",-1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)

    elif name:= request.GET.get('name', ''):
        if searchFlag:
            if name == "asc":
                data = cursor.find({"$text": {"$search": search}}).sort("name",1).skip(skip).limit(limit)
            elif name == "des":
                data = cursor.find({"$text": {"$search": search}}).sort("name",-1).skip(skip).limit(limit)

        else:
            if name == "asc":
                data = cursor.find({}).sort("name",1).skip(skip).limit(limit)
            elif name == "des":
                data = cursor.find({}).sort("name",-1).skip(skip).limit(limit)

    elif date:= request.GET.get('date', ''):
        if searchFlag:
            if date == "asc":
                data = cursor.find({"$text": {"$search": search}}).collation({"locale":"en_US", "numericOrdering": True}).sort("date",1).skip(skip).limit(limit)

            elif date == "des":
                data = cursor.find({"$text": {"$search": search}}).collation({"locale":"en_US", "numericOrdering": True}).sort("date",-1).skip(skip).limit(limit)

        else:
            if date == "asc":
                data = cursor.find({}).sort("date",1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)

            elif date == "des":
                data = cursor.find({}).sort("date",-1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)
    else:
        if searchFlag:
            data = cursor.find({"$text": {"$search": search}}).skip(skip).limit(limit)
        else:
            data = cursor.find({}).sort("bill_id",-1).collation({"locale":"en_US", "numericOrdering": True}).skip(skip).limit(limit)
            # data = cursor.find({}).skip(skip).limit(limit)

    dataDict = [i for i in data]
    context = {
        "data": dataDict,
        "length": length,
        "limit": limit
    }

    return render(request, 'orders.html', context)

def order(request, bill_id):
    cursor = get_db_cursor("DjangoWeb","2022")
    data = cursor.find_one({"bill_id":bill_id})
    context = {
        "data": data
    }
    
    return render(request, 'order.html', context)

def createOrder(request):
    cursor = get_db_cursor("DjangoWeb","2022")
    if cursor.count_documents({}) == 0:
        newId = 1
    else:
        newId = int(cursor.find_one({},sort=[("bill_id", -1 )],collation={"locale":"en_US", "numericOrdering": True})["bill_id"]) + 1
        names = cursor.distinct("name")
    context = {
        "bill_id": newId,
        "names": names
    }
    return render(request, 'createOrder.html', context)

def saveOrder(request):
    cursor = get_db_cursor("DjangoWeb","2022")
    formJson = json.loads(request.body.decode("utf-8"))
    if cursor.find_one({"bill_id":formJson["bill_id"]}):
        cursor.update_one({"bill_id":formJson["bill_id"]},{"$set":formJson})
    else:
        cursor.insert_one(formJson)
    return JsonResponse({"ok":200})

def canvas(request):
    return render(request, 'canvas.html')

def checkID(request):
    id = int(request.body.decode("utf-8"))
    cursor = get_db_cursor("DjangoWeb","2022")

    if cursor.count_documents({"order_id": id }) == 0:
        raise APIException("Order ID does not exist")
    else:
        return JsonResponse({"ok":0})

def changeOrderView(request):
    cursor = get_db_cursor("DjangoWeb","2022")
    id = int(request.body.decode("utf-8"))
    context = cursor.find_one({"order_id":id})

    return render(request, "orderView.html", context)

def updateOrder(request):
    order_details = json.loads(request.body.decode("utf-8"))
    filtered_dict = {k:v for (k,v) in order_details.items() if "order_id" in k}
    print(filtered_dict)
    cursor = get_db_cursor("DjangoWeb","2022")
    print(cursor.update_one(filtered_dict,{ "$set": order_details }))

    return JsonResponse({"ok":0})