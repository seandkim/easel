# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.template.loader import get_template
from bs4 import BeautifulSoup


class Profile(models.Model):
    user = models.OneToOneField(User, null=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    age = models.IntegerField(default=0, blank=True)
    gender = models.CharField(max_length=10, default="", blank=True)
    profilePic = models.ImageField(upload_to="profilePic", blank=True)
    cumVisitorNum = models.IntegerField(default=0, blank=True)

    def __unicode__(self):
        return self.user.username

    def createProject(self, projectName, description):
        if Project.objects.filter(owner=self, name=projectName).count() > 0:
            raise Exception("Project name %s already exists" % projectName)

        project = Project(owner=self, name=projectName,
                          description=description)
        project.save()
        return project

    def getAllProjects(self, projectName):
        project = Project.objects.get(owner=self, name=projectName)
        return Media.objects.filter(project=project)

    def getMedia(self, projectName, mediaName):
        project = Project.objects.get(owner=self, name=projectName)
        return Media.objects.get(project=project, name=mediaName)

    def createSite(self, siteName, description):
        if Site.objects.filter(owner=self, name=siteName).count() > 0:
            raise Exception("Site name %s already exists" % siteName)

        t = get_template('test_pages/dummy_nav.html')
        nav_html = t.render(context={'profile': self})

        site = Site(owner=self, name=siteName, description=description,
                    nav_html=nav_html)
        site.save()
        site.createPage('instruction', opened=True, active=True)
        site.createPage('home', opened=True, active=False)
        site.createPage('about')
        site.createPage('update')  # TODO necessary?
        site.createPage('portfolio')
        return site

    def getAllPages(self, siteName):
        site = Site.objects.get(owner=self, name=siteName)
        return Page.objects.filter(site=site)

    def getPage(self, siteName, pageName):
        site = Site.objects.get(owner=self, name=siteName)
        return Page.objects.get(site=site, name=pageName)


class Project(models.Model):
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    date = models.DateField(auto_now=True)
    description = models.CharField(max_length=1000)

    def __unicode__(self):
        return self.name

    def createMedia(self, mediaName, caption, image):
        if Media.objects.filter(project=self, name=mediaName).count() > 0:
            raise Exception("Media name %s already exists" % mediaName)

        media = Media(project=self, name=mediaName, caption=caption,
                      image=image)
        media.save()
        return media

    def getAllMedias(self):
        return Media.objects.filter(project=self)


class Media(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    caption = models.CharField(max_length=1000)
    # TODO support multi-file (or enforce filetype)
    # media_type = models.CharField(max_length=5)
    # TODO dynmically create upload_to folder
    image = models.ImageField(upload_to='media')

    def __unicode__(self):
        return self.name


class Site(models.Model):
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=1000)
    nav_html = models.TextField(default="")  # TODO default nav?
    mon = models.IntegerField(default=0, blank=True)
    tue = models.IntegerField(default=0, blank=True)
    wed = models.IntegerField(default=0, blank=True)
    thu = models.IntegerField(default=0, blank=True)
    fri = models.IntegerField(default=0, blank=True)
    sat = models.IntegerField(default=0, blank=True)
    sun = models.IntegerField(default=0, blank=True)

    def __unicode__(self):
        s = self.name + '\n'
        for page in Page.objects.filter(site=self):
            s += '- ' + str(page) + '\n'
        return s

    def createPage(self, pageName, opened=False, active=False):
        if Page.objects.filter(site=self, name=pageName).count() > 0:
            raise Exception("Page name %s already exists" % pageName)

        defaultPages = ['instruction', 'home', 'about', 'update', 'portfolio']
        templateName = 'init'
        if pageName in defaultPages:
            templateName = pageName
        filename = 'test_pages/dummy_' + templateName + '.html'
        t = get_template(filename)  # TODO change? dummy works pretty well...
        initHTML = t.render(context={'profile': self.owner})

        page = Page(site=self, name=pageName, content_html=initHTML,
                    published_html="", opened=opened, active=active)
        page.save()
        return page

    def createPageWithHtml(self, pageName, content_html, opened=False, active=False):
        if Page.objects.filter(site=self, name=pageName).count() > 0:
            raise Exception("Page name %s already exists" % pageName)

        page = Page(site=self, name=pageName, content_html=content_html, published_html="",
                    opened=opened, active=active)
        page.save()
        return page

    def deletePage(self, pageName):
        Page.objects.get(site=self, name=pageName).delete()
        return

    def getPage(self, pageName):
        return Page.objects.get(site=self, name=pageName)

    # raises ObjectDoesNotExist if username/sitename is not found
    @staticmethod
    def getSite(username, siteName):
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        site = Site.objects.get(owner=profile, name=siteName)
        return site


class Page(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    # whether user has opened this page in workspace
    # TODO switch to integer to save order of tabs
    opened = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    content_html = models.TextField(default="")
    published_html = models.TextField(default="")

    def __unicode__(self):
        return "%s (%s) %s %s" % (self.name, self.site.name, self.opened, self.active)

    def getNavHTML(self):
        return self.site.nav_html

    def getfullHTML(self):
        # TODO
        soup = BeautifulSoup(self.content_html, 'html.parser')
        nav_html = soup.new_tag(self.getNavHTML())
        content = soup.find('div', class_="main-container")
        print(full)
        return str(full)
