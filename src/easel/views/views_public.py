# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from datetime import datetime
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseBadRequest
from easel.models import Profile, Site
from ipware.ip import get_ip
from easel.views import views_sites

def renderHome(request, username, siteName):
    ip = get_ip(request)
    print('ip=', ip)
    # TODO: check if a request is made by the same ip address within a certain time interval

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

def renderPage(request, username, siteName, pageName, private):
    try:
        site = Site.getSite(username, siteName)
    except:
        return Http404("Site %s by %s does not exist" % (siteName, username))

    try:
        page = site.getPage(pageName)
    except KeyError:
        return Http404("Site %s by %s does not have page named %s" % (siteName, username, pageName))

    if (page.published_html == ""):
        HttpResponse("Found the page but published_html was empty. " +
                     "Make sure you publish the page")

    # TODO change to template where we can render something about easel
    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)

    if private:
        if user == request.user:
            return HttpResponse(views_sites.processPage(page.html))
        # different user tries to access your private (non-published) page
        else:
            return HttpResponseBadRequest()
    else:
        if user == request.user:
            return HttpResponse(page.published_html)

    profile.cumVisitorNum += 1  # cumulative visitor
    profile.save()

    # TODO check that this works
    week = [site.mon, site.tue, site.wed, site.thur, site.fri, site.sat,
            site.sun]
    today = datetime.datetime.today().weekday()
    week[today] += 1
    week[(today+1) % len(week)] = 0

    site.save()

    return HttpResponse(page.published_html)


def notFound(request):
    return HttpResponse("Could not find published page. Are you sure you published the page?")
