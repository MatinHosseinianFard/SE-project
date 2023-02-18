from django.urls import path
from .views import home, suggest

app_name = 'api'

urlpatterns = [
    path('home/', home, name='home-api'),
    path('suggest/', suggest, name='suggest-api')

]