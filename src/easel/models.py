# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from django.template.loader import get_template

class Profile(models.Model):
    user = models.OneToOneField(User, null=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    age = models.IntegerField(default=0, blank=True)
    gender = models.CharField(max_length=10, default="", blank=True)
    profilePic = models.ImageField(upload_to="profilePic", blank=True)

    def __unicode__(self):
        return self.user.username

    def createSite(self, siteName, description):
        if Site.objects.filter(owner=self, name=siteName).count() > 0:
            raise Exception("Site name %s already exists" % siteName)

        site = Site(owner=self, name=siteName, description=description,
                    numVisitor=0)
        site.save()
        site.createPage('home', opened=True, active=False)
        site.createPage('about', opened=True, active=True)
        site.createPage('update') # TODO necessary?
        site.createPage('portfolio')
        return site

    def deleteSite(self, siteName):
        try:
            site = Site.objects.get(owner=self, name=siteName)
            for page in Page.objects.filter(site=site):
                page.delete()
            site.delete()
        except:
            pass

    def getAllPages(self, siteName):
        site = Site.objects.get(owner=self, name=siteName)
        return Page.objects.filter(site=site)

    def getPage(self, siteName, pageName):
        site = Site.objects.get(owner=self, name=siteName)
        return Page.objects.get(site=site, name=pageName)


# TODO create functions for creating/deleting project/media
class Project(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    date = models.DateField(auto_now=True)
    description = models.CharField(max_length=1000)

    def __unicode__(self):
        return self.name

    def getMedia(self):
        return Media.objects.filter(project=self)


class Media(models.Model):
    project = models.ForeignKey(Project)
    # TODO support multi-file
    # media_type = models.CharField(max_length=5)
    # TODO dynmically create upload_to folder
    image = models.ImageField(upload_to='media', blank=True)
    name = models.CharField(max_length=20)
    caption = models.CharField(max_length=1000)

    def __unicode__(self):
        return self.name


class Site(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=1000)
    numVisitor = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

    def createPage(self, pageName, opened=False, active=False):
        if Page.objects.filter(name=pageName).count() > 0:
            raise Exception("Page name %s already exists" % pageName)

        filename = 'test_pages/dummy_' + pageName + '.html'
        t = get_template(filename) # TODO change? dummy file works pretty well...
        initHTML = t.render({})
        page = Page(site=self, name=pageName, html=initHTML, published_html="",
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
    site = models.ForeignKey(Site)
    name = models.CharField(max_length=50)
    # whether user has opened this page in workspace
    opened = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    html = models.CharField(max_length=1000000, default="")
    published_html = models.CharField(max_length=1000000, default="")

    def __unicode__(self):
        return "%s (%s) %s %s" % (self.name, self.site.name, self.opened, self.active)
