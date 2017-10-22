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
from django.http import HttpResponse, Http404
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
        return render(request, 'registration.html', context)

    form = RegistrationForm(request.POST)
    context['form'] = form
    # Validates the form.
    if not form.is_valid():
        return render(request, 'registration.html', context)

    new_user = User.objects.create_user(username=form.cleaned_data['username'], 
                                        password=form.cleaned_data['password1'],
                                       email=form.cleaned_data['email'])
    new_user.save()

    token = default_token_generator.make_token(new_user)
    link = 'http://' + request.get_host() + reverse('confirm') + '/' + new_user.username + '/' + token
    
    email_body = """Welcome to EASEL. Please click on the link below to verify your email address and complete the registration of your account:
    %s""" % (link)   
    
    new_profile = Profile(user = new_user,
                          username = form.cleaned_data['username'], 
                          firstname = form.cleaned_data['firstname'],
                          lastname = form.cleaned_data['lastname'],
                          confirmlink = link, confirmed = 0)
    new_profile.save()
    
    send_mail(subject="Verify your email address",
             message = email_body,
             from_email = "confirm-your-email@easel.com",
             recipient_list = [new_user.email])
    
    context['email'] = form.cleaned_data['email']
    context['message'] = ('A confirmaion email has been sent to ' + new_user.email + 
        '. Please click the link in that email to confirm your email address and complete your registration for EASEL.')

    return render(request, 'registration.html', context)


@login_required
def confirmed(request):
#    TODO
	return render(request, 'base.html', {})

@login_required
def dashboard(request):
#    TODO
    return render(request, 'base.html', {})
