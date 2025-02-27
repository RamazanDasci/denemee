from .models import Menu

def menu_processor(request):
    if request.user.is_authenticated:
        # Sadece kök menüleri al (parent=None)
        main_menus = Menu.objects.filter(
            parent=None,
            is_active=True,
            roles__name=request.user.role.name
        ).distinct().prefetch_related('children')
        
        return {
            'main_menus': main_menus
        }
    return {'main_menus': []}