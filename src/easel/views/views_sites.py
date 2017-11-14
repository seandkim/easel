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
    dummySiteName = 'dummy'

    # make new site called dummy if it doesn't exist

    # TODO change
    return HttpResponseRedirect(reverse('siteEditor', kwargs={'siteName': 'dummy'}))

@login_required
def siteEditor(request, siteName):
    context = {}
    profile = Profile.objects.get(user=request.user)
    projects = Project.objects.filter(owner=profile)
    context['profile'] = profile
    context['projects'] = projects
    return render(request,'site-editor/site-editor.html', context)

# requires POST request with the following argument:
# { 'pageName': <name of the page created> }
@login_required
def addPage(request):
    if request.method != 'POST':
        raise Http404("Invalid Request Method")

    if ('pageName' not in request.POST) or (request.POST['pageName'] == ""):
        raise Http404("Invalid Request Argument")

    # TODO check duplicate page page

    # TODO create new page

# requires POST request with the following argument:
# { 'pageName': <name of the page saving>,
#   'html': <html of the new page> }
@login_required
def savePage(request, pageName):
    if request.method != 'POST':
        raise Http404("Invalid Request Method")

    if ('html' not in request.POST) or (request.POST['html'] == ""):
        raise Http404("Invalid Request Argument")

    # TODO save the page


@login_required
def sitePublish(request):
    return HttpResponse('')
