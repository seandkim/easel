# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User)
    age = models.IntegerField(default=20, blank=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    # picture = models.ImageField(upload_to='', blank=True)
    profilePicID = ""

    def __unicode__(self):
        return self.username


class Photo(models.Model):
    base64 = models.ImageField(upload_to="profile-pics", blank=True)
