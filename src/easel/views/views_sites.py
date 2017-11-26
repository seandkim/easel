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
from bs4 import BeautifulSoup

@login_required
def home(request):
    # TODO change
    profile = Profile.objects.get(user=request.user)
    siteName = 'dummy'
    profile.deleteSite(siteName)
    site = profile.createSite(siteName, "dummydescription")
    # site = Site.objects.get(owner = profile, name=siteName)
    return HttpResponseRedirect(reverse('siteEditor', kwargs={'siteName': site.name}))

@login_required
def siteEditor(request, siteName):
    context = {}
    profile = Profile.objects.get(user=request.user)
    pages = profile.getAllPages(siteName)
    context['profile'] = profile
    context['form'] = AddPageForm()
    context['pages'] = pages
    context['upload_media_form'] = AddMediaForm()

    context['username'] = request.user.username
    context['siteName'] = siteName
    return render(request,'site-editor/site-editor.html', context)

# requires GET request to "/sites/(?P<siteName>\w+)/editor/getPageNames/"
@login_required
def getPageNames(request, siteName):
    site = Site.getSite(request.user.username, siteName)
    pages = Page.objects.filter(site=site)
    context = {'site':site, 'pages':pages}
    return render(request, 'json/pages.json', context,
                           content_type='application/json')

# requires POST
@login_required
def getPageHTML(request, siteName, pageName):
    if request.method != 'GET':
        print("getPageHTML requires GET request")
        raise Http404("Invalid Request Argument")

    profile = Profile.objects.get(user=request.user)
    site = Site.getSite(request.user.username, siteName)
    page = site.getPage(pageName)
    return HttpResponse(page.html)

# requires POST request with the following argument:
# { 'isOpen': <whether page is opened>,
#   'isActive': <whether page is active (focused on editor)> }
@login_required
def changePageStatus(request, siteName, pageName):
    if request.method != 'POST':
        print("getPageHTML requires GET request")
        raise Http404("Invalid Request Argument")

    site = Site.getSite(request.user.username, siteName)
    page = site.getPage(pageName)

    # change open and active field
    isOpened = False
    isActive = False
    if 'isOpened' in request.POST:
        isOpened = (request.POST['isOpened'] == 'true')
    if 'isActive' in request.POST:
        isActive = (request.POST['isActive'] == 'true')

    allPages = Page.objects.filter(site=site)
    page.opened = isOpened
    # if page turned active, change other page to false
    if isActive:
        for otherPage in allPages:
            if otherPage.active:
                otherPage.active = False
                otherPage.save()
        page.active = True
    # if page turned not active
    else:
        page.active = False
    page.save()

    # check that there is only one/zero active tab, depending on whether
    # there is opened tab(s)
    print(allPages.filter(opened=True).count(), allPages.filter(active=True).count())
    if (allPages.filter(opened=True).count() == 0):
        assert(allPages.filter(active=True).count() == 0)
    else:
        assert(allPages.filter(active=True).count() < 2)
    return HttpResponse('')

# requires POST request with the following argument:
# { 'pageName': <name of the page created> }
@login_required
def addPage(request, siteName):
    if request.method != 'POST':
        print("Invalid Request Method")
        raise Http404("Invalid Request Method")

    print("addPage", request.POST)

    form = AddPageForm(request.POST)
    # Validates the form.
    if not form.is_valid():
        # TODO handle error case
        return {'form': form}

    site = Site.getSite(request.user.username, siteName)
    pageName = form.cleaned_data['pageName']

    new_page = site.createPage(pageName)
    new_page.save()
    return HttpResponse("")

@login_required
def deletePage(request, siteName):
    if request.method != 'POST':
        raise Http404("Invalid Request Method")

    if ('pageName' not in request.POST) or (request.POST['pageName'] == ""):
        raise Http404("Invalid Request Argument")

    pageName = request.POST['pageName']

    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        raise Http404("Site %s does not exist" % siteName)

    try:
        page = Page.objects.get(name=pageName, site=site)
    except ObjectDoesNotExist:
        raise Http404("Page %s does not exists in %s" % (pageName, siteName))

    page.delete()
    return HttpResponse('Successfully delete page')

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

    def filterEditable(elem):
        try:
            return elem['contenteditable'] == 'true'
        # if attribute is not present, raises keyError
        except KeyError:
            return False

    for page in pages:
        soup = BeautifulSoup(page.html, 'html.parser')
        print("beautifulsoup parsing")
        for div in soup.find_all('div', class_='empty-workspace-msg'):
            print(div)
            div.decompose()
        for div in soup.find_all(filterEditable):
            print(div)
            div['contenteditable'] = 'false'
            print(div)
        for ud in soup.find_all('', class_="ud"):
            print(ud)
            ud['class'].remove('ud')
            print(ud)

        page.published_html = str(soup)
        page.save()

    return HttpResponse('')
