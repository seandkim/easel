# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


#class User(AbstractUser):
#    pass


class Profile(models.Model):
    user = models.OneToOneField(User)
    username = models.CharField(max_length=40)
    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)
    confirmlink = models.CharField(max_length=200, default="")
    confirmed = models.BooleanField(default=0)
#    age = models.CharField(max_length=40, default="", blank=True)
#    school = models.CharField(max_length=40, default="", blank=True)
#    bio = models.CharField(max_length=420, default="", blank=True)
#    picture = models.ImageField(upload_to='', blank=True)
    
    def __unicode__(self):
        return self.username