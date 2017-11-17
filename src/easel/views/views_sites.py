# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# bunch of imports we probably need later on
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
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
    profile = Profile.objects.get(user=request.user)
    siteName = 'dummy'
    profile.deleteSite(siteName)
    site = profile.createSite(siteName, "dummydescription")
    # TODO change
    # if not Site.objects.filter(owner=profile):
    #     profile.createSite(siteName, "dummydescription")
    #     return HttpResponseRedirect(reverse('siteEditor', kwargs={'siteName': siteName}))
    #
    # site = Site.objects.get(owner = profile, name=siteName)
    return HttpResponseRedirect(reverse('siteEditor', kwargs={'siteName': site.name}))

@login_required
def siteEditor(request, siteName):
    context = {}
    profile = Profile.objects.get(user=request.user)
    projects = Project.objects.filter(owner=profile)
    context['form'] = AddPageForm()
    context['profile'] = profile
    context['projects'] = projects
    return render(request,'site-editor/site-editor.html', context)

# requires GET request to "/sites/(?P<siteName>\w+)/editor/getPageNames/"
@login_required
def getPageNames(request, siteName):
    site = Site.getSite(request.user.username, siteName)
    pages = Page.objects.filter(site=site)
    context = {'site':site, 'pages':pages}
    return render(request, 'json/pages.json', context,
                           content_type='application/json')

# requires GET
@login_required
def getPageHTML(request, siteName, pageName):
    site = Site.getSite(request.user.username, siteName)
    page = site.getPage(pageName)
    context = {'page': page}
    return HttpResponse(page.html)

# requires POST request with the following argument:
# { 'pageName': <name of the page created> }
@login_required
def addPage(request, siteName):
    if request.method != 'POST':
        print("Invalid Request Method")
        raise Http404("Invalid Request Method")

    if ('pageName' not in request.POST) or (request.POST['pageName'] == ""):
        print("Invalid Request Argument")
        raise Http404("Invalid Request Argument")

    pageName = request.POST['pageName'].lower()
    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        print("Site %s does not exist" % siteName)
        raise Http404("Site %s does not exist" % siteName)

    if Page.objects.filter(name=pageName, site=site).count() > 0:
        print("Page %s already exists in %s" % (pageName, siteName))
        raise Http404("Page %s already exists in %s" % (pageName, siteName))

    new_page = site.createPage(pageName)
    new_page.save()
    return HttpResponse("")

# requires POST request with the following argument:
# { 'pageName': <name of the page saving>,
#   'html': <html of the new page> }
@login_required
def savePage(request, siteName):
    if request.method != 'POST':
        raise Http404("Invalid Request Method")

    if ('pageName' not in request.POST) or (request.POST['pageName'] == ""):
        raise Http404("Invalid Request Argument")
    if ('html' not in request.POST) or (request.POST['html'] == ""):
        raise Http404("Invalid Request Argument")

    pageName = request.POST['pageName']
    html = request.POST['html']

    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        raise Http404("Site %s does not exist" % siteName)

    try:
        page = Page.objects.get(name=pageName, site=site)
    except ObjectDoesNotExist:
        raise Http404("Page %s does not exists in %s" % (pageName, siteName))

    page.html = html
    page.save()
    return HttpResponse('')

# requires POST request with the following argument:
# { 'pages': <list of name of pages to be published> }
# if the `pages` argument is empty, it publishes all pages
@login_required
def sitePublish(request, siteName):
    print("sitePublish start", request.POST)
    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        print("Site %s does not exist" % siteName)
        raise Http404("Site %s does not exist" % siteName)

    profile = Profile.objects.get(user=request.user)
    if ('pages' not in request.POST) or (request.POST['pages'] == ""):
        print("Pages are not specified. Publishing all pages")
        pages = profile.getAllPages(siteName)
    else:
        pageNames = request.POST['pages']
        pages = []
        for pageName in pageNames:
            pages.append(profile.getPage(siteName, pageName))

    for page in pages:
        checkStr = 'contenteditable="true"'
        processed = page.html
        while checkStr in processed:
            processed = processed.replace(checkStr, 'contenteditable="false"')
        page.published_html = processed
        page.save()

    return HttpResponse('')
