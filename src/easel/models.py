# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User)
    username = models.CharField(max_length=40)
    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)
    # age = models.IntegerField(default=20, blank=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    # picture = models.ImageField(upload_to='', blank=True)

    def __unicode__(self):
        return self.username

    
class Project(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    date = models.DateField(max_length=20)
    description = models.CharField(max_length=1000)
    
    def __unicode__(self):
        return self.name


class Media(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    project = models.ForeignKey(Project)
    mediatype = models.CharField(max_length=10)
#    mediatype = (
#        (IMAGE, 'image'),
#        (AUDIO, 'audio'),
#        (VIDEO, 'video'),
#    )
    file = models.FileField(upload_to='')
    caption = models.CharField(max_lenth=200)
    
    def __unicode__(self):
        return self.name
    
    
class Site(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=1000)
    url = models.CharField()
    
    def __unicode__(self):
        return self.name

    
class Page(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=40)
    site = models.ForeignKey(Site)
    nrow = models.IntegerField()
    ncol = models.IntegerField()
    url = models.CharField()
    
    def __unicode__(self):
        return self.name
    

class Component(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=40)
    page = models.ForeignKey(Page)
    html = models.CharField()
    nrow = models.IntegerField()
    ncol = models.IntegerField()
    rowIndex = models.IntegerField()
    colIndex = models.IntegerField()

    def __unicode__(self):
        return self.name