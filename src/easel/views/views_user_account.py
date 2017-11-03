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

# Create your views here.
def test_view(request):
	return render(request, 'base.html', {})

def registration(request):
    context = {}

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        context['form'] = RegistrationForm()
        return render(request, 'registration/registration.html', context)

    form = RegistrationForm(request.POST)
    context['form'] = form
    # Validates the form.
    if not form.is_valid():
        return render(request, 'registration/registration.html', context)


	# TODO to allow email confirmation; set is_active to false and change later
    new_user = User.objects.create_user(username=form.cleaned_data['username'],
                                        password=form.cleaned_data['password'],
                                        first_name=form.cleaned_data['first_name'],
                                        last_name=form.cleaned_data['last_name'],
                                        email=form.cleaned_data['email'],
										is_active=True)
    new_user.save()
    new_profile = Profile(user=new_user)
    new_profile.save()
    new_dashboard = Dashboard(user=new_user,
                              visitorNum=0,
                              clapNum=0,
                              projectNum=0,
                              messageNum=0)
    new_dashboard.save()


    login(request, new_user)

    return HttpResponseRedirect(reverse("dashboard"))



@login_required
def settings(request):
    context={}
    cur_user = request.user
    context['form'] = SettingsForm()

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        return render(request, 'settings.html', context)

    form = SettingsForm(request.POST, request.FILES)
    # Validates the form.
    if not form.is_valid():
        context['form'] = form
        return render(request, 'settings.html', context)

    profile = Profile.objects.get(user = cur_user)

    cur_user.first_name = form.cleaned_data['first_name']
    cur_user.last_name = form.cleaned_data['last_name']
    cur_user.set_password(form.cleaned_data['password1'])
    profile.age = form.cleaned_data['age']
    profile.school=form.cleaned_data['school']
    profile.bio=form.cleaned_data['bio']
    if 'picture' in request.FILES and request.FILES['picture'] != '':
		profile.profilePic = request.FILES['picture']

    context['message'] = "Your information has been updated" # TODO

    new_user = authenticate(username=cur_user.username,
                            password=request.user.password)
    login(request, new_user)

    return render(request, 'settings.html', context)

def confirmed(request):
    pass
