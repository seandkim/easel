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

class Dashboard(models.Model):
    user = models.OneToOneField(User, null=True)
    visitorNum = models.IntegerField()
    clapNum = models.IntegerField()
    projectNum = models.IntegerField()
    messageNum = models.IntegerField()

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
    media_type = models.CharField(max_length=5)
    # TODO support multi-file
    # TODO change upload_to folder
    image = models.ImageField(upload_to='media', blank=True)
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
    url = models.CharField(max_length=100)

    def __unicode__(self):
        return self.name

    def getPages(self):
        return Page.objects.filter(site=self)

class Page(models.Model):
    site = models.ForeignKey(Site)
    nrow = models.IntegerField()
    ncol = models.IntegerField()
    url = models.CharField(max_length=100)

    def __unicode__(self):
        return self.name

    def getComponents(self):
        return Component.objects.filter(page=self)

    # TODO
    def getHTML(self):
        return ""

class Component(models.Model):
    page = models.ForeignKey(Page)
    html = models.CharField(max_length=1000) #TODO necessary?
    nrow = models.IntegerField()
    ncol = models.IntegerField()
    row_idx = models.IntegerField()
    col_idx = models.IntegerField()

    def __unicode__(self):
        return self.name

    # TODO
    def getHTML(self):
        return ""
