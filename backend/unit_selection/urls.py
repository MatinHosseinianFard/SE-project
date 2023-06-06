from django.urls import path
from .views import HomePage, AboutPageView, Suggest, addFavourite, seeFavourite, removeFavourite

urlpatterns = [
    path("about/", AboutPageView.as_view(), name="about"),
    path("suggest/", Suggest, name="suggest"),
    path("add-favourite/", addFavourite, name="add-favourite"),
    path("see-favourite/", seeFavourite, name="see-favourite"),
    path("remove-favourite/", removeFavourite, name="remove-favourite"),
    path("", HomePage, name="home"),
]
