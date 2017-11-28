# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.urls import reverse
from easel.models import Profile, Project
from mimetypes import guess_type
import os

def getMessages(request, username):
    return


def getStats(request, username):
    return


def uploadPhoto(request):
    return


def getProfilePhoto(request):
    profile = Profile.objects.get(user=request.user)
    if not profile.profilePic:
        raise Http404
    content_type = guess_type(profile.profilePic.name)
    return HttpResponse(profile.profilePic, content_type=content_type)


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
    except ObjectDoesNotExist:
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

    p2 = Project(owner=profile, name='woman', description="my woman painting")
    p2.save()

    return HttpResponseRedirect(reverse('projects'))


def clearAllUsers(request):
    User.objects.all().delete()
    Profile.objects.all().delete()
    return HttpResponse('')
