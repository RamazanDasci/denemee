from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.contrib import messages

class RoleRequiredMixin(LoginRequiredMixin):
    required_roles = []
    redirect_url = '/login/'
    permission_denied_message = "Bu sayfaya erişim yetkiniz yok!"

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        
        if not request.user.role.name in self.required_roles:
            messages.error(request, self.permission_denied_message)
            return redirect(self.redirect_url)
        
        return super().dispatch(request, *args, **kwargs) 