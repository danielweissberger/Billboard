from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from .models import BoardPost, Comment
from django.http import HttpResponse
from django.utils import timezone
import json
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
# Create your views here.


@login_required(login_url="login/")
def load_posts(request):
    posts = BoardPost.objects.filter(created_date__lte=timezone.now()).order_by('id').reverse()
    return render(request, 'home.html', {'posts': posts})

def guest(request):
    posts = BoardPost.objects.filter(created_date__lte=timezone.now()).order_by('id').reverse()
    return render(request, 'guest.html', {'posts': posts})


def delete_me(request):
    comment_id = request.POST.get("value")
    comment = get_object_or_404(Comment, pk=comment_id)
    comment.delete()
    return HttpResponse('success')


def save_comment(request):

    if request.user.is_authenticated():
        username = request.user.username
        board_post_id = request.POST.get("board_post_id")
        comment_text = request.POST.get("new_comment_text")
        comment_author =username #request.POST.get("new_comment_author")
        created_date = timezone.now()
        Comment.objects.create(text=comment_text, author=comment_author, created_date=created_date, board_post=BoardPost.objects.get(id=board_post_id))
    return HttpResponse()

@login_required(login_url="login/")
def create_post(request):

    if request.user.is_authenticated():
        username = request.user.username
        post_text = request.POST.get("post_text")
        post_title = request.POST.get("post_title")
        post_author = username #request.POST.get("post_author")
        created_date = timezone.now()
        BoardPost.objects.create(text=post_text,author=post_author,created_date=created_date,title=post_title)
    return HttpResponse()

def refresh_posts(request):
    current_post_ids = json.loads(request.POST.get("current_post_ids"))
    current_comment_ids = json.loads(request.POST.get("current_comment_ids"))
    new_posts = []
    new_comments = []
    all_posts = BoardPost.objects.all()
    all_comments = Comment.objects.all()
    for post in all_posts:
        if str(post.id) not in current_post_ids:
            new_posts.append(post)
    for comment in all_comments:
        if str(comment.id) not in current_comment_ids:
            new_comments.append({"comment_html":render_to_string('comment.html',{'comment':comment}), "post_id":comment.board_post.id })
    return JsonResponse({"new_posts":render_to_string('new_posts.html', {'posts': new_posts}), "new_comments": new_comments})