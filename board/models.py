from django.db import models

from django.utils import timezone
# Create your models here.


class BoardPost(models.Model):
    author = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    text = models.TextField()
    created_date = models.DateField(default=timezone.now)

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title


class Comment(models.Model):
    text = models.CharField(max_length=350)
    author = models.CharField(max_length=20)
    created_date = models.DateField(default=timezone.now)
    board_post = models.ForeignKey(BoardPost, on_delete=models.CASCADE)

    def publish(self):
        self.published_date = timezone.now()

    def __str__(self):
        return self.text

