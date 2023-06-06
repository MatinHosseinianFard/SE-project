from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, AuthenticationForm
from django import forms


class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(max_length=100, required=True)
    last_name = forms.CharField(max_length=100, required=True)
    # student_number = forms.CharField(max_length=20, required=True)
    class Meta:
        model = get_user_model()
        fields = ("username", "password1", "password2", "first_name", "last_name")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = "نام کاربری"
        # self.fields['student_number'].label = "شماره دانشجویی"
        self.fields['first_name'].label = "نام"
        self.fields['last_name'].label = "نام خانوادگی"
        self.fields['password1'].label = "رمز"
        self.fields['password2'].label = "تکرار رمز"
        # self.fields['email'].label = "ایمیل"
        self.fields['username'].widget.attrs['placeholder'] = "نام کاربری"
        # self.fields['student_number'].widget.attrs['placeholder'] = "شماره دانشجویی"
        self.fields['first_name'].widget.attrs['placeholder'] = "نام"
        self.fields['last_name'].widget.attrs['placeholder'] = "نام خانوادگی"
        # self.fields['email'].widget.attrs['placeholder'] = "ایمیل"
        self.fields['password1'].widget.attrs['placeholder'] = "رمز"
        self.fields['password2'].widget.attrs['placeholder'] = "تکرار رمز"


    
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = get_user_model()
        fields = (
            # "email",
            "username",
        )

class LoginForm(AuthenticationForm):

    class Meta:
        model = get_user_model()
        fields = ("username", "password")
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = "نام کاربری"
        self.fields['password'].label = "رمز"
        self.fields['username'].widget.attrs['placeholder'] = "نام کاربری"
        self.fields['password'].widget.attrs['placeholder'] = 'رمز'