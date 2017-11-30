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
from .views import views_error


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
    url(r'^projects/deleteProject/$', views_projects.deleteProject, name="deleteProject"),
    url(r'^projects/(?P<projectName>\w+)/getAllMedias/$', views_projects.getAllMedias, {}, name='getAllMedias'),
    url(r'^projects/(?P<projectName>\w+)/getMediaPhoto/(?P<mediaName>\w+)$', views_projects.getMediaPhoto, {}, name='getMediaPhoto'),
    url(r'^projects/(?P<projectName>\w+)/addMedia/$', views_projects.addMedia, name="addMedia"),
    url(r'^projects/(?P<projectName>\w+)/editMedia/(?P<mediaName>\w+)$', views_projects.editMedia, name="editMedia"),
    url(r'^projects/(?P<projectName>\w+)/projectInfo/$', views_projects.editProject, name="editProject"),

    # sites
    url(r'^sites/$', views_sites.home, name="sitesHome"), # list all the sites
    url(r'^sites/(?P<siteName>\w+)/editor/$', views_sites.siteEditor, name="siteEditor"),
    url(r'^sites/(?P<siteName>\w+)/getAllPageNames/$', views_sites.getPageNames, name="getPageNames"),
    url(r'^sites/(?P<siteName>\w+)/getPageHTML/(?P<pageName>\w+)/$', views_sites.getPageHTML, name="getPageHTML"),
    url(r'^sites/(?P<siteName>\w+)/changePageStatus/(?P<pageName>\w+)/$', views_sites.changePageStatus, name="changePageStatus"),
    url(r'^sites/(?P<siteName>\w+)/addPage/$', views_sites.addPage, name="addPage"),
    url(r'^sites/(?P<siteName>\w+)/deletePage/$', views_sites.deletePage, name="deletePage"),
    url(r'^sites/(?P<siteName>\w+)/savePages/$', views_sites.savePages, name="savePages"),
    url(r'^sites/(?P<siteName>\w+)/updateNav/$', views_sites.updateNav, name="updateNav"),
    url(r'^sites/(?P<siteName>\w+)/publish/$', views_sites.sitePublish, name="sitePublish"),
    url(r'^sites/(?P<siteName>\w+)/siteInfo/$', views_sites.editSite, name="editSite"),
    url(r'^sites/addSite/$', views_sites.addSite, name="addSite"),
    url(r'^sites/deleteSite/$', views_sites.deleteSite, name="deleteSite"),
    url(r'^sites/getAllSites/$', views_sites.getAllSites, name="getAllSites"),

    # public (what public audience sees)
    url(r'^public/(?P<username>\w+)/(?P<siteName>\w+)/(?P<pageName>\w+)/$', views_public.renderPage,{'private': False},  name="publicRenderPage"), # list all the sites
    url(r'^private/(?P<username>\w+)/(?P<siteName>\w+)/(?P<pageName>\w+)/$', views_public.renderPage, {'private': True}, name="privateRenderPage"), # list all the sites

    # TODO delete this when deploying - this is for debugging purpose
    url(r'^404/$', views_public.error404),
    url(r'^500/$', views_public.error500),
    url(r'^403/$', views_public.error403),
    url(r'^400/$', views_public.error400),
]
