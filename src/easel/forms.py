from django import forms

from django.contrib.auth.models import User

class RegistrationForm(forms.Form):
    firstname = forms.CharField(max_length = 20)
    lastname = forms.CharField(max_length = 20)
    username = forms.CharField(max_length = 20)
    email = forms.CharField(max_length = 40)
    password1 = forms.CharField(max_length = 200,
                                label='Password',
                                widget = forms.PasswordInput())
    password2 = forms.CharField(max_length = 200,
                                label='Confirm password',
                                widget = forms.PasswordInput())

    def clean(self):
        cleaned_data = super(RegistrationForm, self).clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")

        return cleaned_data



class SettingsForm(forms.Form):
    firstname = forms.CharField(max_length = 20, required=False)
    lastname = forms.CharField(max_length = 20, required=False)

    password1 = forms.CharField(max_length = 200,
                                label='Password',
                                widget = forms.PasswordInput(), required=False)
    password2 = forms.CharField(max_length = 200,
                                label='Confirm password',
                                widget = forms.PasswordInput(), required=False)

#    age = forms.CharField(max_length = 20, required=False)
    school = forms.CharField(max_length = 20, required=False)
    bio = forms.CharField(max_length = 421, required=False)
#    picture = forms.ImageField(label='profile picture', widget=forms.FileInput(), required=False)

    def clean(self):
        cleaned_data = super(SettingsForm, self).clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")

        return cleaned_data
