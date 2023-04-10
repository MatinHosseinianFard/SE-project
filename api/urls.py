from django.urls import path
from .views import home, suggest, addFavourite

app_name = 'api'

urlpatterns = [
    path('home/', home, name='home-api'),
    path('suggest/', suggest, name='suggest-api'),
    path("add-favourite/", addFavourite, name="add-favourite"),
]