from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import RefView, Game
# Create your views here.
import json
from datetime import time


def index(request):

    games = list()
    for g in Game.objects.all():
        games.append({
            "videoId": g.video_id,
            "name": g.name,
            "n_records": RefView.objects.filter(game=g).count(),
            #"start_time": g.start_time,
            #"end_time": g.end,
            #"length": g.end-g.start
        })

    context={'games':games}

    return render(request,"home.html" ,context)






def basejugref(request, videoId):

    template_name = "baseref.html"

    game = Game.objects.get(video_id=videoId);
    #tournaments = Tournament.objects.order_by("-date")

    context = {"videoId": game.video_id}
    return render(request, template_name, context)



def submit_record(request,video_id):
    jsonvalue = json.loads(request.body.decode('utf8'))

    author = jsonvalue["author"]
    refpos = jsonvalue["ref_position"]
    record_name = jsonvalue["name"]

    game = Game.objects.get(video_id=video_id)

    new_ref_view = RefView(name=record_name, author=author, game=game,position=refpos,json_record=jsonvalue)

    new_ref_view.save()

    return  HttpResponse('')
def record_names(request, video_id):
    context = {"record_names" : list()}

    game = Game.objects.get(video_id=video_id)
    records = RefView.objects.filter(game= game)

    for r in records:
        context["record_names"].append({"name":r.name, "ref_pos":r.position, "video_id":game.video_id})

    return JsonResponse(context)

def load_record(request, video_url, position, record_name):
    """ ""
    context = {}
    if "video_url" in request.GET and "record_name" in request.GET and "refPos" in request.GET:
        video_url = request.GET["video_url"]
        record_name = request.GET["record_name"]
        position = request.GET["refPos"]"""
    if True:
        game = Game.objects.get(video_id=video_url)
        record = RefView.objects.filter(game= game, position=position,name=record_name)[0]
        context = record.json_record
    return JsonResponse(context)






