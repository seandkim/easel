# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.http import Http404
from django.shortcuts import render
from easel.models import Profile, Project, Media, Site


@login_required
def home(request):
    context = {}
    profile = Profile.objects.get(user=request.user)
    context = {'profile': profile}

    context['visitorNum'] = profile.cumVisitorNum

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
        context = {"sites": Site.objects.filter(owner=profile)}
        return render(request, 'json/stats.json', context,
                      content_type='application/json')
    return Http404('Unsupported method')
