from django import forms

from django.contrib.auth.models import User

# dummy form for checking file
# TODO delete
class FileForm(forms.Form):
    file = forms.FileInput()

class RegistrationForm(forms.Form):
    first_name = forms.CharField(max_length=20)
    last_name = forms.CharField(max_length=20)
    username = forms.CharField(max_length=20)
    # email = forms.EmailField()
    email = forms.CharField(max_length=20)  # TODO change to emailField
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

        return cleaned_data


class AddProjectForm(forms.Form):
    project_name = forms.CharField(max_length=20)
    description = forms.CharField(max_length=1000)

class AddMediaForm(forms.Form):
    media = forms.ImageField(label='Media', widget=forms.FileInput(), required=True)
    title = forms.CharField(max_length=20)
    description = forms.CharField(max_length=1000)
