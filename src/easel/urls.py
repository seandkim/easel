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

from .views import views_api
from .views import views_user_account
from .views import views_dashboard
from .views import views_projects
from .views import views_sites
from .views import views_public

urlpatterns = [

    # url(r'^getMessages/(?P<username>\w+)$', views_api.getMessages, {}, name='getMessages'),
    # url(r'^getStats/(?P<username>\w+)$', views_api.getStats, {}, name='getStats'),
    url(r'^uploadPhoto/$', views_api.uploadPhoto, {}, name='uploadPhoto'),
    url(r'^makeDefaultProjects/$', views_api.makeDefaultProjects, {}, name='makeDefaultProjects'),
    url(r'^getProfilePhoto/$', views_api.getProfilePhoto, name='getProfilePhoto'),

    # login/registration
    url(r'^registration/$', views_user_account.registration, name="registration"),
    url(r'^login/$', auth_views.LoginView.as_view(template_name='registration/login.html'), name="login"),
    url(r'^logout/$', logout, {'next_page': settings.LOGOUT_REDIRECT_URL}, name="logout"),
    url(r'^settings/$', views_user_account.settings, name="settings"),

    # dashboard
    url(r'^$', views_dashboard.home, name="home"),
    url(r'^dashboard/$', views_dashboard.home, name="dashboard"),
    url(r'^dashboard/getProfile/$', views_dashboard.getProfile, {}, name='getProfile'),


    # projects (TODO change ID to name)
    url(r'^projects/$', views_projects.home, name="projects"), # see list of projects
    url(r'^projects/getAllProjects/$', views_projects.getAllProjects, {}, name='getAllProjects'),
    url(r'^projects/addProject/$', views_projects.addProject, name="addProject"), # form to add project
    url(r'^projects/(?P<projectName>\w+)/getAllMedias/$', views_projects.getAllMedias, {}, name='getAllMedias'),
    url(r'^projects/(?P<projectName>\w+)/getMediaPhoto/(?P<mediaName>\w+)$', views_projects.getMediaPhoto, {}, name='getMediaPhoto'),
    url(r'^projects/(?P<projectName>\w+)/deleteProject/$', views_projects.deleteProject, name="deleteProject"),
    url(r'^projects/(?P<projectName>\w+)/addMedia/$', views_projects.addMedia, name="addMedia"),
    url(r'^projects/(?P<projectName>\w+)/editMedia/(?P<mediaName>\w+)$', views_projects.editMedia, name="editMedia"),

    # sites
    url(r'^sites/$', views_sites.home, name="sitesHome"), # list all the sites
    url(r'^sites/(?P<siteName>\w+)/editor/$', views_sites.siteEditor, name="siteEditor"),
    url(r'^sites/(?P<siteName>\w+)/getAllPageNames/$', views_sites.getPageNames, name="getPageNames"),
    url(r'^sites/(?P<siteName>\w+)/getPageHTML/(?P<pageName>\w+)/$', views_sites.getPageHTML, name="getPageHTML"),
    url(r'^sites/(?P<siteName>\w+)/changePageStatus/(?P<pageName>\w+)/$', views_sites.changePageStatus, name="changePageStatus"),
    url(r'^sites/(?P<siteName>\w+)/addPage/$', views_sites.addPage, name="addPage"),
    url(r'^sites/(?P<siteName>\w+)/copyPage/$', views_sites.copyPage, name="copyPage"),
    url(r'^sites/(?P<siteName>\w+)/deletePage/$', views_sites.deletePage, name="deletePage"),
    url(r'^sites/(?P<siteName>\w+)/savePage/$', views_sites.savePage, name="savePage"),
    url(r'^sites/(?P<siteName>\w+)/publish/$', views_sites.sitePublish, name="sitePublish"),

    # public (what public audience sees)
    url(r'^public/(?P<username>\w+)/(?P<siteName>\w+)/$', views_public.renderHome, name="publicRenderHome"), # list all the sites
    url(r'^public/(?P<username>\w+)/(?P<siteName>\w+)/(?P<pageName>\w+)/$', views_public.renderPage, name="publicRenderPage"), # list all the sites
    url(r'^public/notFound/$', views_public.notFound, name="publicNotFound"), # list all the sites
]
