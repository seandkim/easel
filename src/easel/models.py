# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import AbstractUser


class EaselUser(AbstractUser):
    pass


class Profile(models.Model):
<<<<<<< HEAD
    user = models.OneToOneField(User)
=======
    user = models.OneToOneField(EaselUser)
    username = models.CharField(max_length=40)
>>>>>>> 546b83f0466afc9e508d34734d7d279b94213923
    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)
    # age = models.IntegerField(default=20, blank=True)
    school = models.CharField(max_length=40, default="", blank=True)
    bio = models.CharField(max_length=420, default="", blank=True)
    # picture = models.ImageField(upload_to='', blank=True)

    def __unicode__(self):
        return self.username
