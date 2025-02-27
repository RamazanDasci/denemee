from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role
from django.utils.html import format_html
from django.contrib.admin.widgets import AdminFileWidget
from django.db import models

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_name_display', 'user_count')
    search_fields = ('name',)
    
    def user_count(self, obj):
        return obj.users.count()
    user_count.short_description = 'Kullanıcı Sayısı'

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'full_name', 'get_role_display', 'is_active', 'profile_picture_tag')
    list_filter = ('is_active', 'role')
    search_fields = ('username', 'first_name', 'last_name')
    ordering = ('username',)
    
    def profile_picture_tag(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" style="max-width: 50px; max-height: 50px; border-radius: 50%;"/>'.format(obj.profile_picture.url))
        return "-"
    profile_picture_tag.short_description = 'Profil Resmi'
    
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Ad Soyad'
    
    fieldsets = [
        ('Kullanıcı Bilgileri', {
            'fields': ('username', 'password', 'first_name', 'last_name', 'profile_picture')
        }),
        ('İletişim Bilgileri', {
            'fields': ('phone', 'address')
        }),
        ('Rol ve İzinler', {
            'fields': (
                'role',
                ('is_active', 'is_staff', 'is_superuser'),
            )
        }),
        ('Önemli Tarihler', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    ]
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role', 'profile_picture'),
        }),
    )
    
    formfield_overrides = {
        models.ImageField: {'widget': AdminFileWidget},
    }

admin.site.register(User, CustomUserAdmin)
