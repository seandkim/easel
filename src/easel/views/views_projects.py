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
from mimetypes import guess_type

@login_required
def home(request):
    context = {}
    profile = Profile.objects.get(user = request.user)
    context['form'] = AddProjectForm()
    context['profile'] = profile

    if request.method == 'POST':
        print('hi im here')
        form = AddProjectForm(request.POST)
        context['form'] = form
        # Validates the form.
        if not form.is_valid():
            return render(request, 'project/project-list.html', context)

#        profile = Profile.objects.get(user = request.user)

        new_project = Project(owner=profile,
                              name=form.cleaned_data['project_name'],
                              description=form.cleaned_data['description'])
        new_project.save()
        context['message'] = "Your project has been added"

    return render(request, 'project/project-list.html', context)

@login_required
def addProject(request):
    context = {}

    # Just display the add-project form if this is a GET request.
    if request.method == 'GET':
        context['form'] = AddProjectForm()
        return render(request, 'project/project-add.html', context)

    form = AddProjectForm(request.POST)
    context['form'] = form
    # Validates the form.
    if not form.is_valid():
        return render(request, 'project/project-add.html', context)

    profile = Profile.objects.get(user = request.user)

    new_project = Project(owner=profile,
                          name=form.cleaned_data['project_name'],
                          description=form.cleaned_data['description'])
    new_project.save()
    context['message'] = "Your project has been added"

    return HttpResponseRedirect(reverse("projects"))

@login_required
def deleteProject(request, projectID):
    project = Project.objects.get(id=projectID)
    medias = Media.objects.filter(project=project)
    medias.delete()
    project.delete()
    return HttpResponseRedirect(reverse("projects"))

@login_required
def addMedia(request, projectID):
    context = {'projectID': projectID}
    if request.method == 'GET':
        form = AddMediaForm()
        context['form'] = form
        return render(request, 'project/media-add.html', context)

    form = AddMediaForm(request.POST, request.FILES)

    if not form.is_valid:
        context['form'] = form
        return render(request, 'project/media-add.html', context)

    media = form.save(commit=False)
    media.project = Project.objects.get(id=projectID)
    media.save()

    return HttpResponseRedirect(reverse("projects"))

@login_required
def editMedia(request, projectID, mediaID):
    context = {'projectID': projectID, 'mediaID': mediaID}
    if request.method == 'GET':
        medium = Media.objects.get(id=mediaID)
        initial = {
            'name': medium.name,
            'caption': medium.caption,
            'project': medium.project
        }

        form = EditMediaForm(request.user, initial=initial)
        context['form'] = form
        return render(request, 'project/media-edit.html', context)

    # POST request
    if not 'action' in request.POST or request.POST['action'] == "":
        return HttpResponseRedirect(reverse('projects'))

    action = request.POST['action']
    medium = Media.objects.get(id=mediaID)
    if action == 'Save':
        form = EditMediaForm(request.user, request.POST)
        if not form.is_valid():
            context['form'] = form
            return render(request, 'project/media-edit.html', context)

        medium.project = form.cleaned_data['project']
        medium.name = form.cleaned_data['name']
        medium.caption = form.cleaned_data['caption']
        medium.save()
    elif action == 'Delete':
        medium.delete()
    elif action == 'Cancel':
        pass

    return HttpResponseRedirect(reverse('projects')) # TODO focus on the selected project
