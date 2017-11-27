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
    context = {}
    profile = Profile.objects.get(user = request.user)
    context = {'profile': profile}
#    #TODO
#    profile.visitorNum = 0
#    profile.save()
    
    context['visitorNum'] = profile.cumVisitorNum
#    context['visitorNum'] = 0

    projects = Project.objects.filter(owner=profile)
    mediaNum = 0
    if projects.count() > 0:
        for project in projects:
            mediaNum += Media.objects.filter(project=project).count()
    context['mediaNum'] = mediaNum
    context['projectNum'] = Project.objects.filter(owner=profile).count()
    context['siteNum'] = Site.objects.filter(owner=profile).count()
    
    return render(request, 'dashboard/dashboard.html', context)


@login_required
def getProfile(request):
    if request.method == "GET":
        profile = Profile.objects.get(user=request.user)
        context = {"mon": profile.mon, "tue": profile.tue, "wed": profile.wed, 
                   "thu": profile.thu, "fri": profile.fri, "sat": profile.sat, "sun": profile.sun,
                   "sites": Site.objects.filter(owner=profile)}
        return render(request, 'json/stats.json', context, content_type='application/json')
    return Http404('Unsupported method')