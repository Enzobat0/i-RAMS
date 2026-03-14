from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User

    # Columns shown in the user list view
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined']
    list_filter  = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']

    # Fields shown when EDITING an existing user
    fieldsets = (
        ('Login credentials', {'fields': ('email', 'password')}),
        ('Personal info',     {'fields': ('first_name', 'last_name')}),
        ('Role & permissions',{'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates',   {'fields': ('last_login', 'date_joined')}),
    )

    # Fields shown when CREATING a new user through the admin panel
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2', 'is_active'),
        }),
    )


admin.site.register(User, CustomUserAdmin)

# Cosmetic: give the admin site a title that matches the project
admin.site.site_header = 'i-RAMS Administration'
admin.site.site_title  = 'i-RAMS Admin'
admin.site.index_title = 'User & System Management'