from django import forms

from django.contrib.auth.models import User
from models import Profile, Project, Media, Page, Site
import re


class RegistrationForm(forms.Form):
    first_name = forms.CharField(max_length=20)
    last_name = forms.CharField(max_length=20)
    username = forms.CharField(max_length=20)
    # email = forms.EmailField()
    email = forms.CharField(max_length=50)  # TODO change to emailField
    password = forms.CharField(max_length=200,
                               label='Password',
                               widget=forms.PasswordInput())
    password1 = forms.CharField(max_length=200,
                                label='Confirm password',
                                widget=forms.PasswordInput())

    def clean_username(self):
        # Confirms that the username is not already present in the
        # User model database.
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Username is already taken.")

        # Generally return the cleaned data we got from the cleaned_data
        # dictionary
        return username

    def clean(self):
        cleaned_data = super(RegistrationForm, self).clean()
        password = cleaned_data.get('password')
        password1 = cleaned_data.get('password1')
        if password and password1 and password != password1:
            raise forms.ValidationError("Passwords did not match.")

        return cleaned_data


class SettingsForm(forms.Form):
    first_name = forms.CharField(max_length=20, required=False)
    last_name = forms.CharField(max_length=20, required=False)

    password1 = forms.CharField(max_length=200,
                                label='Password',
                                widget=forms.PasswordInput(), required=False)
    password2 = forms.CharField(max_length=200,
                                label='Confirm password',
                                widget=forms.PasswordInput(), required=False)

    age = forms.CharField(max_length=20, required=False)
    school = forms.CharField(max_length=20, required=False)
    bio = forms.CharField(max_length=421, required=False)
    picture = forms.ImageField(
        label='profile picture', widget=forms.FileInput(), required=False)

    def clean(self):
        cleaned_data = super(SettingsForm, self).clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")
        if password1 != '' and password2 == '':
            raise forms.ValidationError("Please confirm your password.")
        return cleaned_data


class AddProjectForm(forms.Form):
    projectName = forms.CharField(max_length=20)
    description = forms.CharField(max_length=1000)
    username = forms.CharField(widget=forms.HiddenInput(), required=False)

    def clean(self):
        cleaned_data = super(AddProjectForm, self).clean()
        if cleaned_data.get('projectName') is None:
            raise forms.ValidationError("Project name is required")
        if cleaned_data.get('description') is None:
            raise forms.ValidationError("Project description is required")
        projectName = cleaned_data.get('projectName').lower()
        description = cleaned_data.get('description')
        username = cleaned_data.get('username')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        if Project.objects.filter(owner=profile, name=projectName.lower()).count() > 0:
            raise forms.ValidationError(
                "Project '%s' already exists" % projectName.lower())
        if not re.match("^[a-zA-Z0-9_]+$", projectName):
            # TODO : project name can contain underscore right now
            raise forms.ValidationError(
                "Project name can only contain alphabets and numbers")
        if '\\' in description:
            raise forms.ValidationError(
                "Project description cannot contain '\\'")
        return cleaned_data


class AddMediaForm(forms.ModelForm):
    username = forms.CharField(widget=forms.HiddenInput(), required=False)

    class Meta:
        model = Media
        exclude = ('project',)
        widgets = {'image': forms.FileInput()}

    def clean(self):
        cleaned_data = super(AddMediaForm, self).clean()
        mediaName = cleaned_data.get('name').lower()
        username = cleaned_data.get('username')
        print('username = ', username)
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        projects = Project.objects.filter(owner=profile)
        media = Media.objects.filter(project__in=projects, name=mediaName)

        assert(media.count() < 2)
        if media.count() == 1:
            raise forms.ValidationError(
                "Media '%s' already exists" % mediaName.lower())
        if not re.match("^[a-zA-Z0-9_]+$", mediaName):
            # TODO : media name can contain underscore right now
            raise forms.ValidationError(
                "Media name can only contain alphabets and numbers")
        return cleaned_data


class EditMediaForm(forms.Form):
    def __init__(self, user, *args, **kwargs):
        super(EditMediaForm, self).__init__(*args, **kwargs)
        profile = Profile.objects.get(user=user)
        projects = Project.objects.filter(owner=profile)
        self.fields['project'].queryset = projects

    # project field is overwritten with choice field
    # it is declared here to display first in the form
    project = forms.ModelChoiceField(queryset=None, empty_label=None)
    # image = forms.FileField() TODO
    name = forms.CharField(max_length=20)
    caption = forms.CharField(max_length=1000)
    username = forms.CharField(widget=forms.HiddenInput(), required=False)
    oldName = forms.CharField(widget=forms.HiddenInput(), required=False)

    # TODO image file is not required. Either implement that or delete this
#    def is_valid(self):
#        valid = super(EditMediaForm, self).is_valid()
#        return valid

    def clean(self):
        cleaned_data = super(EditMediaForm, self).clean()
        project = cleaned_data.get('project')
        mediaName = cleaned_data.get('name').lower()
        username = cleaned_data.get('username')
        oldName = cleaned_data.get('oldName')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        projects = Project.objects.filter(owner=profile)
        media = Media.objects.filter(project__in=projects, name=mediaName)

        assert(media.count() < 2)
        if media.count() == 1:
            if mediaName != oldName:
                raise forms.ValidationError(
                    "Media '%s' already exists" % mediaName.lower())
        if not re.match("^[a-zA-Z0-9_]+$", mediaName):
            # TODO : media name can contain underscore right now
            raise forms.ValidationError(
                "Media name can only contain alphabets and numbers")
        return cleaned_data


class AddPageForm(forms.Form):
    username = forms.CharField(widget=forms.HiddenInput(), required=False)
    siteName = forms.CharField(widget=forms.HiddenInput(), required=False)
    pageName = forms.CharField(max_length=20)

    def clean(self):
        cleaned_data = super(AddPageForm, self).clean()
        username = cleaned_data.get('username')
        siteName = cleaned_data.get('siteName')
        pageName = cleaned_data.get('pageName').lower()
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        site = Site.objects.get(owner=profile, name=siteName)
        page = Page.objects.filter(site=site, name=pageName)

        assert(page.count() < 2)
        if page.count() == 1:
            raise forms.ValidationError(
                "Page '%s' already exists" % pageName.lower())
        if not re.match("^[a-zA-Z0-9_]+$", pageName):
            # TODO : media name can contain underscore right now
            raise forms.ValidationError(
                "Page name can only contain alphabets and numbers")
        return cleaned_data


class AddSiteForm(forms.Form):
    siteName = forms.CharField(max_length=20)
    username = forms.CharField(widget=forms.HiddenInput(), required=False)
    description = forms.CharField(max_length=1000)

    def clean(self):
        cleaned_data = super(AddSiteForm, self).clean()
        siteName = cleaned_data.get('siteName').lower()
        username = cleaned_data.get('username')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        sites = Site.objects.filter(owner=profile, name=siteName.lower())

        assert(sites.count() < 2)
        if sites.count() == 1:
            raise forms.ValidationError(
                "Site '%s' already exists" % siteName.lower())
        if not re.match("^[a-zA-Z0-9_]+$", siteName):
            # TODO : media name can contain underscore right now
            raise forms.ValidationError(
                "Site name can only contain alphabets and numbers")
        return cleaned_data
