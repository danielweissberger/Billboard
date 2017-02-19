from django.contrib import admin
from .models import BoardPost, Comment
# Register your models here.

admin.site.register(BoardPost)
admin.site.register(Comment)

