# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, null=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    age = models.IntegerField(default=0, blank=True)
    gender = models.CharField(max_length=10, default="", blank=True)
    profilePic = models.ImageField(upload_to="profilePic", blank=True)

    def __unicode__(self):
        return self.user.username

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

    # TODO
    def getHTML(self):
        return "<img src=''></img>"

class Site(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=1000)
    numVisitor = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

    def getPages(self):
        return Page.objects.filter(site=self)

    @staticmethod
    def getSite(self, user, siteName):
        profile = Profile.objects.get(user=user)
        site = Site.objects.get(owner=profile, name=siteName)
        return site

class Page(models.Model):
    site = models.ForeignKey(Site)
    name = models.CharField(max_length=50)
    html = models.CharField(max_length=1000000, default="")
    published_html = models.CharField(max_length=1000000, default="")

    def __unicode__(self):
        return "%s (%s)" % (self.path, self.site.name)
