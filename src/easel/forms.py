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
    first_name = forms.CharField(max_length=20, required=True)
    last_name = forms.CharField(max_length=20, required=True)

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
        if password1 == '' and password2 != '':
            raise forms.ValidationError("Password field is required.")
        return cleaned_data


class AddProjectForm(forms.Form):
    projectName = forms.CharField(max_length=20)
    description = forms.CharField(max_length=1000)

    def is_valid(self, user):
        valid = super(AddProjectForm, self).is_valid()
        if not valid:
            return False

        projectName = self.cleaned_data.get('projectName').lower()
        description = self.cleaned_data.get('description')
        profile = Profile.objects.get(user=user)

        if Project.objects.filter(owner=profile, name=projectName.lower()).count() > 0:
            self.add_error(None, "Project '%s' already exists"
                           % projectName.lower())
            return False

        if not re.match("^[a-zA-Z0-9_]+$", projectName):
            # TODO : project name can contain underscore right now
            self.add_error("projectName", "Project name can only contain alphabets and numbers")
            return False

        if '\\' in description:
            self.add_error("description",
                           "Project description cannot contain '\\'")
            return False

        return True


class AddMediaForm(forms.ModelForm):
    class Meta:
        model = Media
        exclude = ('project',)
        widgets = {'image': forms.FileInput()}

    def is_valid(self, user):
        valid = super(AddMediaForm, self).is_valid()
        if not valid:
            return False

        mediaName = self.cleaned_data.get('name').lower()
        profile = Profile.objects.get(user=user)
        projects = Project.objects.filter(owner=profile)
        media = Media.objects.filter(project__in=projects, name=mediaName)

        assert(media.count() < 2)
        if media.count() == 1:
            self.add_error("name",
                           "Media '%s' already exists" % mediaName.lower())
            return False

        if not re.match("^[a-zA-Z0-9_]+$", mediaName):
            self.add_error("name",
                           "Media name can only contain alphabets and numbers")
            return False

        return True


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
    oldName = forms.CharField(widget=forms.HiddenInput(), required=False)

    def is_valid(self, user):
        valid = super(EditMediaForm, self).is_valid()
        if not valid:
            return False

        mediaName = self.cleaned_data.get('name')
        oldName = self.cleaned_data.get('oldName')
        profile = Profile.objects.get(user=user)
        projects = Project.objects.filter(owner=profile)
        media = Media.objects.filter(project__in=projects, name=mediaName)

        assert(media.count() < 2)
        if media.count() == 1:
            if mediaName != oldName:
                self.add_error("name",
                               "Media '%s' already exists" % mediaName.lower())
                return False

        if not re.match("^[a-zA-Z0-9_]+$", mediaName):
            self.add_error("name",
                           "Media name can only contain alphabets and numbers")
            return False

        return True


class AddPageForm(forms.Form):
    pageName = forms.CharField(max_length=20)

    def is_valid(self, user, siteName):
        valid = super(AddPageForm, self).is_valid()
        if not valid:
            return False

        pageName = self.cleaned_data.get('pageName').lower()
        profile = Profile.objects.get(user=user)
        try:
            site = Site.objects.get(owner=profile, name=siteName)
        except Site.DoesNotExist:
            self.add_error(None, 'Site does not exist')
            return False

        page = Page.objects.filter(site=site, name=pageName)
        assert(page.count() < 2)
        if page.count() == 1:
            self.add_error('pageName', "Page '%s' already exists" %
                           pageName.lower())
            return False

        if not re.match("^[a-zA-Z0-9_]+$", pageName):
            self.add_error('pageName',
                           "Page name can only contain alphabets and numbers")
            return False

        return True


class AddSiteForm(forms.Form):
    siteName = forms.CharField(max_length=20)
    description = forms.CharField(max_length=1000)

    def is_valid(self, user):
        valid = super(AddSiteForm, self).is_valid()
        if not valid:
            return False

        siteName = self.cleaned_data.get('siteName').lower()
        profile = Profile.objects.get(user=user)
        sites = Site.objects.filter(owner=profile, name=siteName)

        assert(sites.count() < 2)
        if sites.count() == 1:
            self.add_error("siteName",
                           "Site '%s' already exists" % siteName.lower())
            return False

        if not re.match("^[a-zA-Z0-9_]+$", siteName):
            self.add_error("siteName",
                           "Site name can only contain alphabets and numbers")
            return False

        return True
    

class EditSiteForm(forms.Form):
    siteName = forms.CharField(max_length=20)
    description = forms.CharField(max_length=1000)
    oldName = forms.CharField(widget=forms.HiddenInput(), required=False)

    def is_valid(self, user):
        valid = super(EditSiteForm, self).is_valid()
        if not valid:
            return False
        
        oldName = self.cleaned_data.get('oldName').lower()
        siteName = self.cleaned_data.get('siteName').lower()
        profile = Profile.objects.get(user=user)
        sites = Site.objects.filter(owner=profile, name=siteName)

        assert(sites.count() < 2)
        if sites.count() == 1:
            if siteName != oldName:
                self.add_error("siteName",
                           "Site '%s' already exists" % siteName.lower())
                return False

        if not re.match("^[a-zA-Z0-9_]+$", siteName):
            self.add_error("siteName",
                           "Site name can only contain alphabets and numbers")
            return False

        return True
