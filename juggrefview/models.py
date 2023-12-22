from django.contrib.auth.models import User
from django.db import models
import json
# Create your models here.

import uuid



class Game(models.Model):
    video_id = models.CharField(max_length=200)
    name = models.CharField(max_length=200)


    def __str__(self):
        return self.name


class PointReview(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    start = models.IntegerField(default=0,db_comment="start Time Code of the review")
    end = models.IntegerField(default=0,db_comment="end Time Code of the review")



class RefView(models.Model):
    REFPOS = [
        ("main", "Main Ref"),
        ("second", "Second Ref"),
        ("right", "Goal right"),
        ("left", "Goal left"),
    ]


    name = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True)
    description = models.CharField(max_length=400)

    position = models.CharField(max_length=30,choices=REFPOS)
    #json_file   = models.FileField(upload_to="JuggJuggRef/json_records/", default="file.json")
    json_record   = models.JSONField()#upload_to="JuggJuggRef/json_records/", default="file.json")


    #fileName = models.CharField(max_length=100, blank=True,unique=True)


    #file
    def __str__(self):
        return self.name

    def get_json(self):
        with open(self.json_file.path,"r") as f:
            return json.load(f)

    def set_json(self,jsondata):
        file.save(str(uuid.uuid4()), json.dumps(jsondata))
        with open(self.json_file.path,"w") as f:
            return json.dump(jsondata,f,indent=4)

    @staticmethod
    def gen_filename(rec_name, author, game):
        out = rec_name+"_"+author+"_"+game+"_"
        out +=str(uuid.uuid4())
        return out