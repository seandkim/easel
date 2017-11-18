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
        form = AddProjectForm(request.POST)
        context['form'] = form
        # Validates the form.
        if not form.is_valid():
            return render(request, 'project/project-list.html', context)

        # profile = Profile.objects.get(user = request.user)

        new_project = Project(owner=profile,
                              name=form.cleaned_data['project_name'],
                              description=form.cleaned_data['description'])
        new_project.save()
        context['message'] = "Your project has been added"

    return render(request, 'project/project-list.html', context)


def getAllProjects(request):
    if request.method == "GET":
        profile = Profile.objects.get(user=request.user)
        projects = Project.objects.filter(owner=profile)
        context = {"username": profile.user.username, "projects": projects}
        return render(request, 'json/projects.json', context, content_type='application/json')
    return HttpResponse('')


def getAllMedias(request, projectName):
    if request.method == "GET":
        project = Project.objects.get(name=projectName)
        media = Media.objects.filter(project=project).order_by('id')

        context = {"projectName": projectName, "media": media}
        return render(request, 'json/media.json', context, content_type='application/json')

    return HttpResponse('')


def getMediaPhoto(request, projectName, mediaName):
    if type == 'media':
        medium = Media.objects.get(name=name)
        content_type = guess_type(medium.image.name)
        print("content type is", content_type)
        return HttpResponse(medium.image, content_type=content_type)

	return serveDummyImage();

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
def deleteProject(request, projectName):
    project = Project.objects.get(name=projectName)
    medias = Media.objects.filter(project=project)

    medias.delete()
    project.delete()
    return HttpResponseRedirect(reverse("projects"))

@login_required
def addMedia(request, projectName):
    context = {'projectName': projectName}
    if request.method == 'GET':
        form = AddMediaForm()
        context['form'] = form
        return render(request, 'project/media-add.html', context)

    form = AddMediaForm(request.POST, request.FILES)

    if not form.is_valid():
        context['form'] = form
        return render(request, 'project/media-add.html', context)

    media = form.save(commit=False)
    media.project = Project.objects.get(name=projectName)
    media.save()

    return HttpResponseRedirect(reverse("projects"))

@login_required
def editMedia(request, projectName, mediaName):
    context = {'projectName': projectName, 'mediaName': mediaName}
    if request.method == 'GET':
        medium = Media.objects.get(name=mediaName)
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
    medium = Media.objects.get(name=mediaName)
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
