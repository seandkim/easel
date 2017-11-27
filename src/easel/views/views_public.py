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
from ipware.ip import get_ip
import datetime

    
def renderHome(request, username, siteName):
    ip = get_ip(request)
    print('ip=', ip)
    ###TODO: check if a request is made by the same ip address within a certain time interval
    
    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)
    profile.visitorNum += 1
    profile.save()

    return renderPage(request, username, siteName, 'home')

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def renderPage(request, username, siteName, pageName):
    try:
        site = Site.getSite(username, siteName)
    except:
        raise Http404("Site %s by %s does not exist" % (siteName, username))

    try:
        page = site.getPage(pageName)
    except:
        raise Http404("Site %s by %s does not have page named %s" % (siteName, username, pageName))

    if (page.published_html == ""):
        HttpResponse("Found the page but published_html was empty. Make sure you publish the page")

    # TODO change to template where we can render something about easel
    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)
    if user == request.user:
        print("me myself and I !!!!!!!!!!!")
        return HttpResponse(page.published_html)

    profile.cumVisitorNum += 1  #cumulative visitor
    profile.save()
    
    if datetime.datetime.today().weekday() == 0:  #Monday
        site.tue = 0
        site.mon += 1
    if datetime.datetime.today().weekday() == 1:  #Tuesday
        site.wed = 0
        site.tue += 1
    if datetime.datetime.today().weekday() == 2:  #Wednesday
        site.thur = 0
        site.wed += 1
    if datetime.datetime.today().weekday() == 3:  #Thursday
        site.fri = 0
        site.thu += 1
    if datetime.datetime.today().weekday() == 4:  #Friday
        site.sat = 0
        site.fri += 1
    if datetime.datetime.today().weekday() == 5:  #Saturday
        site.sun = 0
        site.sat += 1
    if datetime.datetime.today().weekday() == 6:  #Sunday
        site.mon = 0
        site.sun += 1

    site.save()
    
    return HttpResponse(page.published_html)

def notFound(request):
    return HttpResponse("Could not find published page. Are you sure you published the page?")
