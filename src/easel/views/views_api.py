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

def getProjects(request):
	if request.method == "GET":
		profile = Profile.objects.get(user=request.user)
		projects = Project.objects.filter(owner=profile)
		context = {"username": profile.user.username, "projects": projects}
		return render(request, 'json/projects.json', context, content_type='application/json')
	return HttpResponse('')

def getMedia(request, projectID):
    if request.method == "GET":
        project = Project.objects.get(id=int(projectID))
        media = Media.objects.filter(project=project).order_by('name')

        context = {"projectID": projectID, "media": media}
        return render(request, 'json/media.json', context, content_type='application/json')

	return HttpResponse('')

def getMessages(request, username):
	return

def getStats(request, username):
	return

def uploadPhoto(request):
    return

def getPhoto(request, photoID):
	# user = Photo.objects.get(username=username)
    # profile = Profile.objects.get(user=user)
    #
    # if not profile.picture:
    #     user = User.objects.get(username="defaultuser")
    #     profile = Profile.objects.get(user=user)
    #     content_type = guess_type(profile.picture.name)
    #     return HttpResponse(profile.picture, content_type=content_type)
    #
    # content_type = guess_type(profile.picture.name)
    return HttpResponse(profile.picture, content_type=content_type)

def makeDefaultProjects(request):

	return HttpResponse('')

def clearAllUsers(request):
	User.objects.all().delete()
	Profile.objects.all().delete()
	return HttpResponse('')
