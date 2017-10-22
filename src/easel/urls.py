"""webapps URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import logout
from django.conf import settings

from easel import views

urlpatterns = [
    url(r'^$', views.dashboard, name="home"),
    url(r'^testpage/', views.test_view, name="test_view"),

    # API calls
    url(r'^getProjects/(?P<username>\w+)$', views.getProjects, {}, name='getProjects'),
    url(r'^getMedia/(?P<project_id>\w+)$', views.getMedia, {}, name='getMedia'),
    url(r'^getMessages/(?P<username>\w+)$', views.getMessages, {}, name='getMessages'),
    url(r'^getStats/(?P<username>\w+)$', views.getStats, {}, name='getStats'),
    url(r'^getPhoto/(?P<photo_id>\w+)$', views.getPhoto, {}, name='getPhoto'),

    # login/registration
    url(r'^registration', views.registration, name="registration"),
    url(r'^login$', auth_views.LoginView.as_view(template_name='registration/login.html'), name="login"),
    url(r'^logout/$', logout, {'next_page': settings.LOGOUT_REDIRECT_URL}, name="logout"),
    url(r'^confirm-registration', views.confirmed, name='confirm'),
    url(r'^settings', views.settings, name='settings'),
]
