# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from datetime import datetime
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.http import HttpResponseForbidden, HttpResponseBadRequest
from easel.models import Profile, Site
from ipware.ip import get_ip
from easel.views import views_sites


def renderHome(request, username, siteName):
    ip = get_ip(request)
    print('ip=', ip)
    # TODO only increase visitor if same ip request is made after certain
    # interval

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
    except ObjectDoesNotExist:
        print("Site %s by %s does not exist" % (siteName, username))
        return HttpResponseBadRequest()

    try:
        page = site.getPage(pageName)
    except ObjectDoesNotExist:
        print("Site %s by %s does not have page named %s"
              % (siteName, username, pageName))
        return HttpResponseBadRequest()

    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)

    if private:
        if user == request.user:
            return HttpResponse(views_sites.processPage(request.user, siteName,
                                                        page))
        # do not allow different user tries to access your private
        # (non-published) page
        else:
            return HttpResponseForbidden()
    else:
        if user == request.user:
            return HttpResponse(page.published_html)

    profile.cumVisitorNum += 1  # cumulative visitor
    profile.save()

    # TODO check that this works
    week = [site.mon, site.tue, site.wed, site.thu, site.fri, site.sat,
            site.sun]
    today = datetime.today().weekday()
    week[today] += 1
    week[(today+1) % len(week)] = 0

    site.save()

    return HttpResponse(page.published_html)
