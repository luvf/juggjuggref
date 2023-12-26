from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import RefView, Game,PointReview

# Create your views here.
import json
from datetime import time


def index(request):

    points = list()
    for point in PointReview.objects.all():
        points.append({
            "videoId": point.game.video_id,
            "name": point.game.name,
            "n_records": RefView.objects.filter(point_reviewed=point).count(),
            "start_time": point.start,
            "end_time": point.end,
            "length": point.end-point.start
        })

    context={'reviews':points}

    return render(request,"home.html" ,context)






def basejugref(request, videoId, start):

    template_name = "baseref.html"

    game = Game.objects.get(video_id=videoId);
    review = PointReview.objects.get(game=game, start=start)
    #tournaments = Tournament.objects.order_by("-date")

    context = {"videoId": game.video_id, "review": review}
    return render(request, template_name, context)



def submit_record(request, videoId, start):
    jsonvalue = json.loads(request.body.decode('utf8'))

    author = jsonvalue["author"]
    refpos = jsonvalue["ref_position"]
    record_name = jsonvalue["name"]

    review = PointReview.objects.get(game__video_id=videoId, start=start)
    if review:
        new_ref_view = RefView(name=record_name, author=author, point_reviewed=review,position=refpos,json_record=jsonvalue)

        new_ref_view.save()

        return HttpResponse('',status=201)
    else:
        return HttpResponse('',status=404)

def record_names(request, videoId, start):
    context = {"record_names" : list()}

    review = PointReview.objects.get(game__video_id=videoId,start=start)
    records = RefView.objects.filter(point_reviewed=review)

    for r in records:
        context["record_names"].append({"name":r.name, "ref_pos":r.position, "video_id":videoId})

    return JsonResponse(context, status=200)

def load_record(request, videoId, start, position, record_name):
    """"
    :param videoId:
    :param start:
    :param position:
    :param record_name:
    
    """
    game = Game.objects.get(video_id=videoId)
    review = PointReview.objects.get(game__video_id=videoId, start=start)

    record = RefView.objects.filter(point_reviewed=review, position=position,name=record_name)[0]
    context = record.json_record
    return JsonResponse(context, status=200)






