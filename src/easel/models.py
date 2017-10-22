# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


#class User(AbstractUser):
#    pass


class Profile(models.Model):
    user = models.OneToOneField(User)
    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)
    # age = models.IntegerField(default=20, blank=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    # picture = models.ImageField(upload_to='', blank=True)

    def __unicode__(self):
        return self.username
