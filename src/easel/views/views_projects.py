# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, HttpResponseRedirect
from django.http import HttpResponseNotAllowed, HttpResponseBadRequest
from django.shortcuts import render
from django.urls import reverse
from easel.models import Profile, Project, Media
from easel.forms import AddProjectForm, AddMediaForm, EditMediaForm
from easel.error import JsonErrorResponse
from mimetypes import guess_type


@login_required
def home(request):
    context = {}
    profile = Profile.objects.get(user=request.user)
    context['add_project_form'] = AddProjectForm()
    context['profile'] = profile

    if request.method == 'POST':
        form = AddProjectForm(request.POST)
        context['add_project_form'] = form
        # Validates the form.
        if not form.is_valid(request.user):
            return render(request, 'project/project-list.html', context)

        new_project = Project(owner=profile,
                              name=form.cleaned_data['projectName'],
                              description=form.cleaned_data['description'])
        new_project.save()

    return render(request, 'project/project-list.html', context)


@login_required
def getAllProjects(request):
    if request.method == "GET":
        profile = Profile.objects.get(user=request.user)
        projects = Project.objects.filter(owner=profile)
        context = {"username": profile.user.username, "projects": projects}
        return render(request, 'json/projects.json', context,
                      content_type='application/json')
    return HttpResponseNotAllowed('GET')


@login_required
def getAllMedias(request, projectName):
    profile = Profile.objects.get(user=request.user)
    if request.method == "GET":
        project = Project.objects.get(owner=profile, name=projectName)
        medias = Media.objects.filter(project=project).order_by('id')

        context = {"projectName": projectName, "medias": medias}
        return render(request, 'json/medias.json', context,
                      content_type='application/json')

    return HttpResponseNotAllowed('GET')


@login_required
def getMediaPhoto(request, projectName, mediaName):
    try:
        profile = Profile.objects.get(user=request.user)
        media = profile.getMedia(projectName, mediaName)
    except ObjectDoesNotExist:
        return HttpResponseBadRequest()
    content_type = guess_type(media.image.name)
    return HttpResponse(media.image, content_type=content_type)

@login_required
def addProject(request):
    # Just display the add-project form if this is a GET request.
    if request.method == 'GET':
        return HttpResponseNotAllowed('POST')

    form = AddProjectForm(request.POST)
    # Validates the form.
    if not form.is_valid(request.user):
        return JsonErrorResponse(400, form.errors)

    profile = Profile.objects.get(user=request.user)

    new_project = Project(owner=profile,
                          name=form.cleaned_data['projectName'],
                          description=form.cleaned_data['description'])
    new_project.save()

    context = {"username": request.user.username, "projects": [new_project]}
    return render(request, 'json/projects.json', context,
                  content_type='application/json')


@login_required
def deleteProject(request, projectName):
    if request.method == 'GET':
        return HttpResponseNotAllowed('POST')

    try:
        profile = Profile.objects.get(user=request.user)
        project = Project.objects.get(owner=profile, name=projectName)
        medias = Media.objects.filter(project=project)
    except ObjectDoesNotExist:
        return HttpResponseBadRequest()

    medias.delete()
    project.delete()
    return HttpResponseRedirect(reverse("projects"))


@login_required
def addMedia(request, projectName):
    profile = Profile.objects.get(user=request.user)
    context = {'projectName': projectName, 'profile': profile}

    if request.method == 'GET':
        # TODO can we delete this now that we use modal?
        print('get request')
        form = AddMediaForm()
        context['add_media_form'] = form
        return render(request, 'project/media-add.html', context)

    print(request.POST)
    form = AddMediaForm(request.POST, request.FILES)
    if not form.is_valid(request.user):
        print('form is not valid')
        context['add_media_form'] = form
        return render(request, 'project/media-add.html', context)

    media = form.save(commit=False)
    profile = Profile.objects.get(user=request.user)
    project = Project.objects.get(owner=profile, name=projectName)
    media.project = project
    media.save()

    return HttpResponseRedirect(reverse("projects"))


@login_required
def editMedia(request, projectName, mediaName):
    profile = Profile.objects.get(user=request.user)
    context = {'projectName': projectName,
               'mediaName': mediaName, 'profile': profile}
    if request.method == 'GET':
        medium = Media.objects.get(name=mediaName)
        initial = {
            'name': medium.name,
            'caption': medium.caption,
            'project': medium.project
        }

        form = EditMediaForm(user=request.user, initial=initial)
        context['edit_media_form'] = form
        return render(request, 'project/media-edit.html', context)

    # POST request
    if 'action' not in request.POST or request.POST['action'] == "":
        return HttpResponseRedirect(reverse('projects'))

    action = request.POST['action']
    medium = Media.objects.get(name=mediaName)
    if action == 'Save':
        form = EditMediaForm(request.user, request.POST)
        if not form.is_valid(request.user):
            context['edit_media_form'] = form
            return render(request, 'project/media-edit.html', context)
        medium.project = form.cleaned_data['project']
        medium.name = form.cleaned_data['name']
        medium.caption = form.cleaned_data['caption']
        medium.save()
    elif action == 'Delete':
        medium.delete()
    elif action == 'Cancel':
        pass

    # TODO focus on the selected project
    return HttpResponseRedirect(reverse('projects'))
