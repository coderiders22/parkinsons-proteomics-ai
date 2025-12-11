"""
Django URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/django/auth/', include('django_app.apps.users.urls')),
    path('api/v1/django/predictions/', include('django_app.apps.predictions.urls')),
]
