from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm

CustomUser = get_user_model()

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    add_fieldsets = (
            (
                None,
                {
                    'classes': ('wide',),
                    'fields': ( 'username', 'password1', 'password2'),
                },
            ),
        )
    list_display = [
        "username",
        "email",
        "is_superuser",
    ]
    
    
admin.site.register(CustomUser, CustomUserAdmin)