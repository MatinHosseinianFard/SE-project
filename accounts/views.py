from django.urls import reverse_lazy
from django.views.generic import FormView
from django.views import generic, View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout

from .forms import CustomUserCreationForm, LoginForm


class SignupPageView(generic.CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"
    

class UserLoginView(FormView):
    form_class = LoginForm
    template_name = "registration/login.html"
    success_url = reverse_lazy("home")

    def form_valid(self, form):
        user = form.get_user()
        login(self.request, user)
        return super().form_valid(form)

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form, error="نام کاربری یا رمز عبور اشتباه است"))


def UserLogout(request):
    logout(request)
    return redirect("home")