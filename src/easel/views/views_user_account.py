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
	print("registration start1", request.method=="GET")
	context = {}

    # Just display the registration form if this is a GET request.
	if request.method == 'GET':
		print("request is GET")
		context['form'] = RegistrationForm()
		print("hello")
		return render(request, 'registration/registration.html', context)

	print("hello")
	form = RegistrationForm(request.POST)
	context['form'] = form
	print('form is valid?', form.is_valid())
    # Validates the form.
	if not form.is_valid():
		print("form is not valid")
		return render(request, 'registration/registration.html', context)

	print("registering...")

	# TODO to allow email confirmation; set is_active to false and change later
	new_user = User.objects.create_user(username=form.cleaned_data['username'],
                                        password=form.cleaned_data['password'],
                                        first_name=form.cleaned_data['first_name'],
                                        last_name=form.cleaned_data['last_name'],
                                        email=form.cleaned_data['email'],
										is_active=True)

	new_user.save()
	new_profile = Profile(user = new_user)
	new_profile.save()
	login(request, new_user)
	print("loggin in")
	return HttpResponseRedirect(reverse("home"))


@login_required
def confirmed(request):
#    TODO
	return render(request, 'base.html', {})


@login_required
def settings(request):
    context={}
    cur_user = request.user
    profile = Profile.objects.get(user = cur_user)
    context['profile'] = profile
    context['form'] = SettingsForm()
    context['id'] = profile.username

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        return render(request, 'settings.html', context)

    new_profile = Profile(user=cur_user)
    form = SettingsForm(request.POST, request.FILES)
    # Validates the form.
    if not form.is_valid():
        context['form'] = form
        return render(request, 'settings.html', context)

#    if (len(form.cleaned_data['bio']) > 420):
#        context['error'] = "Your bio cannot be longer than 420 characters"
#        return render(request, 'settings.html', context)

    if 'firstname' in request.POST and request.POST['firstname'] != '':
        Profile.objects.select_for_update().filter(user=cur_user).update(fullname=form.cleaned_data['firstname'])

    if 'lastname' in request.POST and request.POST['lastname'] != '':
        Profile.objects.select_for_update().filter(user=cur_user).update(fullname=form.cleaned_data['lastname'])

    if 'password1' in request.POST and request.POST['password1'] != '':
        cur_user.set_password(form.cleaned_data['password1'])
        cur_user.save()


    context['message'] = "Your information has been updated"

    profile = Profile.objects.get(user=cur_user)
    context['profile'] = profile
    context['id'] = profile.username

    new_user = authenticate(username=cur_user.username,
                            password=request.user.password)
    login(request, new_user)

    return render(request, 'settings.html', context)
