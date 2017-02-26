#!python
#log/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .forms import NewUserForm, LoginForm
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
# Create your views here.
# this login required decorator is to not allow to any  
# view without authenticating



@login_required(login_url="login/")
def home(request):
    return render(request,"home.html")



def register(request):

    password=""
    if request.method == "POST":
        form = NewUserForm(request.POST)
        if form.is_valid():
            new_user = User.objects.create_user(request.POST.get("username"),'',request.POST.get("password1"))
            new_user.save()
            new_user = authenticate(username=request.POST.get("username"), password=request.POST.get("password1"))
            login(request, new_user)
            # redirect, or however you want to get to the main view
            return HttpResponseRedirect('/board')
    else:
        form = NewUserForm()

    return render(request, 'register.html', {'form': form})

