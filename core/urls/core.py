from django.urls import path
from core.views.core import (
    HomeView,
    LoginView,
    DashboardView,
    OwnerDashboardView,
    PersonelDashboardView,
    AttendantDashboardView,
    UserDashboardView
)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('owner-dashboard/', OwnerDashboardView.as_view(), name='owner-dashboard'),
    path('personel-dashboard/', PersonelDashboardView.as_view(), name='personel-dashboard'),
    path('attendant-dashboard/', AttendantDashboardView.as_view(), name='attendant-dashboard'),
    path('user-dashboard/', UserDashboardView.as_view(), name='user-dashboard'),
]
