# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# bunch of imports we probably need later on
from datetime import datetime
from django.core.mail import EmailMessage
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout, tokens
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.db import transaction
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.template import Context
from django.template.loader import get_template
from django.urls import reverse
from django.utils.dateparse import parse_datetime
from django.utils.encoding import force_text
from django.utils.http import urlsafe_base64_decode
from easel.models import *
from easel.forms import *
from time import localtime, strftime

@login_required
def home(request):
    profile = Profile.objects.get(user = request.user)
    if not Site.objects.filter(owner = profile):
        new_site = Site(owner = profile, name = "dummy",
                        description = "this is a dummy site",
                       url = "", numVisitor = "24")
        new_site.save()
        return HttpResponseRedirect(reverse('siteEditor', kwargs={'siteName': 'dummy'}))

    # make new site called dummy if it doesn't exist
    
    # TODO change
    site = Site.objects.get(owner = profile)
    return HttpResponseRedirect(reverse('siteEditor', kwargs={'siteName': site.name}))

@login_required
def siteEditor(request, siteName):
    context = {}
    profile = Profile.objects.get(user=request.user)
    projects = Project.objects.filter(owner=profile)
    context['profile'] = profile
    context['projects'] = projects
    return render(request,'site-editor/site-editor.html', context)

@login_required
def pageSave(request):
    return HttpResponse('')

@login_required
def sitePublish(request):
    return HttpResponse('')
