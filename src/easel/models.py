# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User)
    age = models.IntegerField(default=20, blank=True)
    # school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    # picture = models.ImageField(upload_to='', blank=True)
    
    ####0 if male, 1 if female####
#    gender = models.BooleanField(default="0")
    
    def __unicode__(self):
        return self.username
    
    def getProjects(self):
        return Project.objects.filter(owner=self)
    
#    def getSites(self):
#        return Site.objects.filter(owner=self)
    
    
class Project(models.Model):
    owner = models.ForeignKey(Profile)
    name = models.CharField(max_length=20)
    date = models.DateField()
    description = models.CharField(max_length=1000)
    
    def __unicode__(self):
        return self.name

    def getMedia(self):
        return Media.objects.filter(project=self)
    
    
class Media(models.Model):
    project = models.ForeignKey(Project)
#    MEDIA_TYPE = (
#        ('img', 'Image'),
#        ('aud', 'Audio'),
#        ('vid', 'Video'),
#    )
#    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE)
    media_type = models.CharField(max_length=5)
    file = models.FileField(upload_to='')
    caption = models.CharField(max_lenth=200)
    
    def __unicode__(self):
        return self.name
    
    def getHTML(self):
        return 
    

    
    
#
#class Site(models.Model):
#    owner = models.ForeignKey(Profile)
#    name = models.CharField(max_length=20)
#    description = models.CharField(max_length=1000)
#    url = models.CharField()
#    
#    def __unicode__(self):
#        return self.name
#    
#    def getPages(self):
#        return Page.objects.filter(site=self)
#    
#    
#class Page(models.Model):
#    site = models.ForeignKey(Site)
#    nrow = models.IntegerField()
#    ncol = models.IntegerField()
#    url = models.CharField()
#    
#    def __unicode__(self):
#        return self.name
#    
#    def getComponents(self):
#        return Component.objects.filter(page=self)
#
#    def getHTML(self):
#        return 
#    
#class Component(models.Model):
#    page = models.ForeignKey(Page)
#    html = models.CharField()
#    nrow = models.IntegerField()
#    ncol = models.IntegerField()
#    row_idx = models.IntegerField()
#    col_idx = models.IntegerField()
#
#    def __unicode__(self):
#        return self.name
#    
#    def getHTML(self):
#        return 