# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from easel.models import Profile, Project
from easel.forms import RegistrationForm, SettingsForm


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

    login(request, new_user)
    # add ungrouped project under user
    new_project = Project(owner=new_profile,
                          name='ungrouped',
                          description='Ungrouped media belongs here.')
    new_project.save()
    return HttpResponseRedirect(reverse("dashboard"))


@login_required
def settings(request):
    context = {}
    cur_user = request.user
    profile = Profile.objects.get(user=cur_user)

    initial = {
        'first_name': cur_user.first_name,
        'last_name': cur_user.last_name,
        'age': profile.age,
        'school': profile.school,
        'bio': profile.bio
    }
    context['form'] = SettingsForm(initial=initial)

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        return render(request, 'settings.html', context)

    form = SettingsForm(request.POST, request.FILES)
    # Validates the form.
    if not form.is_valid():
        context['form'] = form
        return render(request, 'settings.html', context)
    # TODO cleanup
    if form.cleaned_data['first_name'] != '':
        cur_user.first_name = form.cleaned_data['first_name']
    if form.cleaned_data['last_name'] != '':
        cur_user.last_name = form.cleaned_data['last_name']
    if form.cleaned_data['password1'] != '':
        cur_user.set_password(form.cleaned_data['password1'])
    if form.cleaned_data['age'] != '':
        profile.age = form.cleaned_data['age']
    if form.cleaned_data['school'] != '':
        profile.school = form.cleaned_data['school']
    if form.cleaned_data['bio'] != '':
        profile.bio = form.cleaned_data['bio']
    if 'picture' in request.FILES and request.FILES['picture'] != '':
        profile.profilePic = request.FILES['picture']
    print('form age =', form.cleaned_data['age'])
    print('profile age = ', profile.age)
    cur_user.save()
    profile.save()
#    context['message'] = "Your information has been updated" # TODO

    new_user = authenticate(username=cur_user.username,
                            password=request.user.password)
    login(request, new_user)

    return HttpResponseRedirect(reverse("dashboard"))
