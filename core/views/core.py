from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views import View
from core.mixins import RoleRequiredMixin

class HomeView(View):
    def get(self, request):
        return render(request, 'public/homepage.html')

class LoginView(View):
    def get(self, request):
        return render(request, 'public/login.html')
    
    def post(self, request):
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')
            remember_me = request.POST.get('remember_me')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                if not remember_me:
                    request.session.set_expiry(0)
                return redirect('dashboard')
            else:
                messages.error(request, 'Geçersiz kimlik no veya şifre!')
                
        return render(request, 'public/login.html')

class DashboardView(RoleRequiredMixin, View):
    required_roles = ['owner', 'personel', 'attendant', 'user']
    
    def get(self, request):
        if request.user.role.name == 'owner':
            return redirect('owner-dashboard')
        elif request.user.role.name == 'personel':
            return redirect('personel-dashboard')
        elif request.user.role.name == 'attendant':
            return redirect('attendant-dashboard')
        return redirect('user-dashboard')

class OwnerDashboardView(RoleRequiredMixin, View):
    required_roles = ['owner']
    template_name = 'dashboard/owner.html'
    
    def get(self, request):
        return render(request, self.template_name)

class PersonelDashboardView(RoleRequiredMixin, View):

    required_roles = ['personel']
    template_name = 'dashboard/personel.html'

    
    def get(self, request):
        return render(request, self.template_name)

class AttendantDashboardView(RoleRequiredMixin, View):
    required_roles = ['attendant']
    template_name = 'dashboard/attendant.html'
    
    def get(self, request):
        return render(request, self.template_name )

class UserDashboardView(RoleRequiredMixin, View):
    required_roles = ['user']
    template_name = 'dashboard/user.html'
    
    def get(self, request):
        return render(request, self.template_name)
