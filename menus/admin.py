from django.contrib import admin
from .models import Menu

class MenuAdmin(admin.ModelAdmin):
    list_display = ('title', 'url_name', 'parent', 'order', 'is_active', 'get_roles')
    list_filter = ('is_active', 'roles')
    search_fields = ('title', 'url_name')
    ordering = ('order', 'title')
    filter_horizontal = ('roles',)
    
    def get_roles(self, obj):
        return ", ".join([role.get_name_display() for role in obj.roles.all()])
    get_roles.short_description = "Roller"

admin.site.register(Menu, MenuAdmin)