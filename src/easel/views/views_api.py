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
from PIL import Image, ImageTk
import os

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
        media = Media.objects.filter(project=project).order_by('id')

        context = {"projectID": projectID, "media": media}
        return render(request, 'json/media.json', context, content_type='application/json')

    return HttpResponse('')


def getMessages(request, username):
    return


def getStats(request, username):
    return


def uploadPhoto(request):
    return


def getProfilePhoto(request):
    profile = Profile.objects.get(user = request.user)
    if not profile.profilePic:
        raise Http404
    content_type = guess_type(profile.profilePic.name)
    return HttpResponse(profile.profilePic, content_type=content_type)


def getPhoto(request, type, id1):
    if type == 'media':
        # try:
        medium = Media.objects.get(id=id1)
        print("medium is", medium)
        content_type = guess_type(medium.image.name)
        print("content type is", content_type)
        return HttpResponse(medium.image, content_type=content_type)
        # except:
        #     print("There was an error: ", medium.image)
        #     print(medium.image.name)
        #     pass

	return serveDummyImage();

def serveDummyImage():
	# if dynamic file is not found
	try:
		print(os.getcwd())
		valid_image = "easel/static/img/placeholders/apartment.png"
		with open(valid_image, "rb") as f:
			return HttpResponse(f.read(), content_type="image/jpeg")
	except IOError:
		# TODO https://stackoverflow.com/questions/3003146/best-way-to-write-an-image-to-a-django-httpresponse/15832328
		print("File not found")
		return HttpResponse("")

def makeDefaultProjects(request):
    try:
        user = User.objects.get(username='henri_matisse')
    except:
        user = User.objects.create_user(username='henri_matisse',
                    password='123',
                    first_name='Henri',
                    last_name='Matisse',
                    email='henri_matisse@gmail.com')
        user.save()
        profile = Profile(user=user)
        profile.save()

    login(request, user)
    profile = Profile.objects.get(user=user)

    Project.objects.filter(owner=profile).delete()
    p1 = Project(owner=profile, name='paper', description="my late paper work")
    p1.save()
    for i in range(3):
        m1 = Media(project=p1, name="Paper "+str(i), caption="caption "+str(i))
        m1.save()

    p2 = Project(owner=profile, name='woman', description="my woman painting")
    p2.save()

    return HttpResponseRedirect(reverse('projects'))

def clearAllUsers(request):
    User.objects.all().delete()
    Profile.objects.all().delete()
    return HttpResponse('')
