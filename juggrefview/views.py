from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import RefView, Game
# Create your views here.
import json

def basejugref(request):
    template_name = "baseref.html"

    #tournaments = Tournament.objects.order_by("-date")

    context = {"videoId": "31WnroMlStc" }
    return render(request, template_name, context)



def submit_record(request,video_url):
    jsonvalue = json.loads(request.body.decode('utf8'))

    author = jsonvalue["author"]
    refpos = jsonvalue["ref_position"]
    record_name = jsonvalue["name"]

    game = Game.objects.get(url=video_url)

    new_ref_view = RefView(name=record_name, author=author, game=game,position=refpos,json_record=jsonvalue)

    new_ref_view.save()

    return  HttpResponse('')
def record_names(request, video_url):
    context = {"record_names" : list()}

    game = Game.objects.get(url=video_url)
    records = RefView.objects.filter(game= game)

    for r in records:
        context["record_names"].append({"name":r.name, "ref_pos":r.position, "video_id":game.url})

    return JsonResponse(context)

def load_record(request, video_url, position, record_name):
    """ ""
    context = {}
    if "video_url" in request.GET and "record_name" in request.GET and "refPos" in request.GET:
        video_url = request.GET["video_url"]
        record_name = request.GET["record_name"]
        position = request.GET["refPos"]"""
    if True:
        game = Game.objects.get(url=video_url)
        record = RefView.objects.filter(game= game, position=position,name=record_name)[0]
        context = record.json_record
    return JsonResponse(context)






