# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class Profile(models.Model):
    username = models.CharField(max_length=40)
    firstname = models.CharField(max_length=40)
    lastname = models.CharField(max_length=40)
    confirmlink = models.CharField(max_length=200, default="")
    confirmed = models.BooleanField(default=0)
  
    def __unicode__(self):
        return self.fullname