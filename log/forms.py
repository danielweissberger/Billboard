from django.contrib.auth.forms import AuthenticationForm
from django import forms
from django.contrib.auth.forms import UserCreationForm

class LoginForm(AuthenticationForm):
    username = forms.CharField(label="Username", max_length=30,
                               widget=forms.TextInput(attrs={'class': 'userinput form-control', 'name': 'username'}))
    password = forms.CharField(label="Password", max_length=30,
                               widget=forms.PasswordInput(attrs={'class': 'userinput form-control', 'name': 'password'}))


class NewUserForm(UserCreationForm):
    username = forms.CharField(label="Username", max_length=30,
                               widget=forms.TextInput(attrs={'class': 'userinput form-control', 'name': 'username'}))
    password1 = forms.CharField(label="Password", max_length=30,
                               widget=forms.PasswordInput(attrs={'class': 'userinput form-control', 'name': 'password'}))
    password2 = forms.CharField(label="Confirm Password", max_length=30,
                               widget=forms.PasswordInput(attrs={'class': 'userinput form-control', 'name': 'password_confirmation'}))



