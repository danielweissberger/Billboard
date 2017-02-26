from django.conf.urls import url
from . import views

urlpatterns = [
    # url(r'^(?P<comment_id>[0-9]+)/$', views.delete_me, name='delete'),
    url(r'^$', views.load_posts, name='post_list'),
    url(r'^save_comment$', views.save_comment, name='save_comment'),
    url(r'^create_post$', views.create_post, name='create_post'),
    url(r'^refresh_posts', views.refresh_posts, name='refresh_posts'),
    url(r'^[0-9]+$', views.delete_me, name='delete'),
    url(r'^guest', views.guest, name='guest'),

    #url(r'2', views.delete_me, name='delete'),
]
