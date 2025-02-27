from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages

class RoleAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        
        if hasattr(view_func, 'view_class'):
            view_class = view_func.view_class
            if hasattr(view_class, 'required_roles'):
                if not request.user.is_authenticated:
                    return redirect(reverse('login') + f'?next={request.path}')
                
                if request.user.role.name not in view_class.required_roles:
                    messages.error(request, "Yetkisiz erişim!")
                    return redirect(reverse('dashboard'))
        return None 