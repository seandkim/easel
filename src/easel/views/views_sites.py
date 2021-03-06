# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, JsonResponse
from django.http import HttpResponseBadRequest, HttpResponseNotAllowed
from django.shortcuts import render
from django.template.loader import get_template
from django.urls import reverse
from easel.models import Profile, Site, Page
from easel.forms import AddSiteForm, AddPageForm, AddMediaForm, EditSiteForm
from easel.error import JsonErrorResponse, Json400, Json405
from bs4 import BeautifulSoup


@login_required
def home(request):
    profile = Profile.objects.get(user=request.user)
    sites = Site.objects.filter(owner=profile)
    siteCount = sites.count()
    context = {}
    context["add_site_form"] = AddSiteForm()
    context["edit_site_form"] = EditSiteForm()
    context["profile"] = profile

    if siteCount == 0:
        return render(request, 'site-editor/no-site.html', context)
    else:
        context["sites"] = sites
        return render(request, 'site-editor/site-menu.html', context)


@login_required
def siteEditor(request, siteName):
    context = {}
    profile = Profile.objects.get(user=request.user)
    site = Site.objects.get(owner=profile, name=siteName)
    pages = profile.getAllPages(siteName)
    context['add_page_form'] = AddPageForm()
    context['add_media_form'] = AddMediaForm()
    context['add_site_form'] = AddSiteForm()

    context['username'] = request.user.username
    context['profile'] = profile
    context['site'] = site
    context['pages'] = pages
    context['sites'] = Site.objects.filter(owner=profile)
    return render(request, 'site-editor/site-editor.html', context)


# requires GET request to "/sites/(?P<siteName>\w+)/editor/getPageNames/"
@login_required
def getPageNames(request, siteName):
    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        return HttpResponseBadRequest()
    pages = Page.objects.filter(site=site)
    context = {'site': site, 'pages': pages}
    return render(request, 'json/pages.json', context,
                           content_type='application/json')


# requires GET request
@login_required
def getPageHTML(request, siteName, pageName):
    if request.method != 'GET':
        return Json405('GET')

    site = Site.getSite(request.user.username, siteName)
    page = site.getPage(pageName)
    return JsonResponse({'nav_html': page.getNavHTML(),
                         'content_html': page.content_html})


# requires POST request with the following argument:
# { 'isOpen': <whether page is opened>,
#   'isActive': <whether page is active (focused on editor)> }
@login_required
def changePageStatus(request, siteName, pageName):
    if request.method != 'POST':
        return Json405('POST')

    try:
        site = Site.getSite(request.user.username, siteName)
        page = site.getPage(pageName)
    except ObjectDoesNotExist:
        return Json400()

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
    if (allPages.filter(opened=True).count() == 0):
        assert(allPages.filter(active=True).count() == 0)
    return JsonResponse({'success': True})


@login_required
def addSite(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    form = AddSiteForm(request.POST)
    profile = Profile.objects.get(user=request.user)

    if not form.is_valid(request.user):
        return JsonErrorResponse(400, form.errors)

    siteName = request.POST['siteName']
    description = request.POST['description']
    profile = Profile.objects.get(user=request.user)
    new_site = profile.createSite(siteName, description)
    new_site.save()
    return HttpResponseRedirect(reverse('siteEditor',
                                kwargs={'siteName': siteName}))


@login_required
def deleteSite(request):
    if request.method != 'POST':
        return Json405('POST')
    if ('siteName' not in request.POST) or (request.POST['siteName'] == ""):
        print("siteName not in request.POST")
        return Json400()
    profile = Profile.objects.get(user=request.user)
    siteName = request.POST['siteName']
    try:
        Site.objects.get(owner=profile, name=siteName).delete()
    except ObjectDoesNotExist:
        print("Site name %s does not exist" % siteName)
        return Json400()
    count = Site.objects.filter(owner=profile).count()
    return JsonResponse({'success': True, 'count': count})


@login_required
def editSite(request, siteName):
    profile = Profile.objects.get(user=request.user)
    site = Site.objects.get(name=siteName, owner=profile)

    if request.method != 'POST':
        return JsonResponse({'siteName': site.name,
                             'description': site.description})
    form = EditSiteForm(request.POST)
    if not form.is_valid(request.user):
        return JsonErrorResponse(400, form.errors)

    newName = form.cleaned_data['siteName']
    description = form.cleaned_data['description']

    site.name = newName
    site.description = description
    site.save()

    return JsonResponse({'success': True})


# requires POST request with the following argument:
# { 'pageName': <name of the page created>
#   'html': <html of new page; if empty, uses default template>}
# returns json response of newly added page
@login_required
def addPage(request, siteName):
    if request.method != 'POST':
        return Json405('POST')

    form = AddPageForm(request.POST)
    # Validates the form.
    if not form.is_valid(request.user, siteName):
        print("form is not valid: %s", form.errors)
        return JsonErrorResponse(400, form.errors)

    site = Site.getSite(request.user.username, siteName)
    pageName = form.cleaned_data['pageName']

    new_page = site.createPage(pageName)
    if ('copyPageName' in request.POST and request.POST['copyPageName'] != ""):
        copyPageName = request.POST['copyPageName']
        try:
            copyPage = site.getPage(copyPageName)
        except ObjectDoesNotExist:
            HttpResponseBadRequest()

        new_page.content_html = copyPage.content_html

    new_page.save()

    context = {'site': site, 'pages': [new_page]}
    return render(request, 'json/pages.json', context,
                           content_type='application/json')


@login_required
def deletePage(request, siteName):
    if request.method != 'POST':
        return Json405('POST')

    if ('pageName' not in request.POST) or (request.POST['pageName'] == ""):
        return Json400()

    pageName = request.POST['pageName']

    try:
        site = Site.getSite(request.user.username, siteName)
        page = Page.objects.get(name=pageName, site=site)
    except ObjectDoesNotExist:
        return Json400()

    page.delete()
    return JsonResponse({'success': True})


# requires POST request with the following argument:
# { 'pageNames': <names of the pages saving>,
#   'htmls': <htmls of the new pages, in the correct index as above> }
@login_required
def savePages(request, siteName):
    def processSavePage(html):
        soup = BeautifulSoup(html, 'html.parser')
        for e in soup.find_all():
            del e['data-medium-editor-element']

        return str(soup)

    if request.method != 'POST':
        return Json405("POST")

    if ('pageNames[]' not in request.POST) or (request.POST['pageNames[]'] == ""):
        print('No pageNames[] argument in POST request')
        return Json400()
    if ('htmls[]' not in request.POST) or (request.POST['htmls[]'] == ""):
        print('No htmls[] argument in POST request')
        return Json400()

    pageNames = request.POST.getlist('pageNames[]')
    htmls = request.POST.getlist('htmls[]')

    if (len(pageNames) != len(htmls)):
        print('pageName and htmls does not have same length')
        return Json400()
    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        print("Site %s does not exist" % siteName)
        return Json400()

    # retrieve all pages first. This is for ensuring it wouldn't raise an error
    # in the middle of saving some pages
    pages = []
    for pageName in pageNames:
        try:
            pages.append(Page.objects.get(name=pageName, site=site))
        except ObjectDoesNotExist:
            print("Page %s does not exists in %s" % (pageName, siteName))
            return Json400()

    for i in range(len(pageNames)):
        pages[i].content_html = processSavePage(htmls[i])
        pages[i].save()

    return JsonResponse({'success': True})


@login_required
def updateNav(request, siteName):
    if request.method != 'POST':
        return Json405("POST")

    if ('nav_html' not in request.POST) or (request.POST['nav_html'] == ""):
        print('No nav_html argument in POST request')
        return Json400()

    nav_html = request.POST['nav_html']

    try:
        site = Site.getSite(request.user.username, siteName)
    except ObjectDoesNotExist:
        print("Site %s does not exist" % siteName)
        return Json400()

    site.nav_html = nav_html
    site.save()

    return JsonResponse({'success': True})


# requires POST request with the following argument:
# { 'pageNames': <list of name of pages to be published> }
# if the `pages` argument is empty, it publishes all pages
@login_required
def sitePublish(request, siteName):
    profile = Profile.objects.get(user=request.user)
    if ('pageNames[]' not in request.POST) or (request.POST['pageNames[]'] == ""):
        print("Pages are not specified. Publishing all pages")
        return Json400

    pageNames = request.POST.getlist('pageNames[]')
    pages = []
    for pageName in pageNames:
        pages.append(profile.getPage(siteName, pageName))

    for page in pages:
        page.published_html = processPage(request.user, siteName, page)
        page.save()

    return JsonResponse({'success': True})


# process page for publishing & previewing
def processPage(user, siteName, page):
    profile = Profile.objects.get(user=user)
    allPageNames = profile.getAllPages(siteName).values_list('name', flat=True)

    def filterEditable(elem):
        try:
            return elem['contenteditable'] == 'true'
        except KeyError:
            return False

    # routed the relative link in nav to other pages
    soup = BeautifulSoup(page.site.nav_html, 'html.parser')
    for a in soup.find_all('a'):
        try:
            if a["href"] in allPageNames:
                a["href"] = "../" + a["href"] + "/"
        # if a tag doesn't contain href
        except KeyError:
            pass

    processed_nav_html = str(soup)

    # process content_html to have no edtiable material
    soup = BeautifulSoup(page.content_html, 'html.parser')
    for div in soup.find_all('div', class_='empty-workspace-msg'):
        div.decompose()
    for div in soup.find_all('div', class_='delete-ud-wrapper'):
        div.decompose()
    for div in soup.find_all(filterEditable):
        div['contenteditable'] = 'false'

    remove_classnames = ['ud']
    for name in remove_classnames:
        for ud in soup.find_all('', class_=name):
            if ud.get('id') == 'ud-focus':
                del ud['id']
            ud['class'].remove(name)

    processed_content_html = str(soup)

    t = get_template('test_pages/wrapper.html')
    context = {'siteName': page.site.name,
               'pageName': page.name,
               'processed_nav_html': processed_nav_html,
               'processed_content_html': processed_content_html}
    wrapper_html = t.render(context=context)

    return wrapper_html


def getAllSites(request):
    if request.method == "GET":
        profile = Profile.objects.get(user=request.user)
        sites = Site.objects.filter(owner=profile)
        context = {"username": profile.user.username, "sites": sites}
        return render(request, 'json/sites.json', context,
                      content_type='application/json')

    return HttpResponseNotAllowed('GET')
