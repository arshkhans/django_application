from django.urls import path, re_path
from . import views

urlpatterns = [
    path('orders/', views.orders, name='orders'),
    path('order/<str:bill_id>', views.order, name='order'),
    path('canvas/', views.canvas, name='canvas'),
    path('createOrder/', views.createOrder, name='createOrder'),
    path('saveOrder/', views.saveOrder, name='saveOrder'),
    path('changeOrderView/', views.changeOrderView, name='changeOrderView'),
    path('updateOrder/', views.updateOrder, name='updateOrder'),
    path('', views.test, name='test'),
]