from django.urls import path
from .views import HomeApiView

app_name = 'api'

urlpatterns = [
    path('home/', HomeApiView.as_view(), name='home-api')
]