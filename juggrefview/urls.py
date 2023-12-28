from django.urls import path
from . import views


app_name = "juggrefview"
urlpatterns = [
    path("", views.index, name="home"),
    path("video/<str:videoId>/review/<int:start>", views.basejugref, name="review"),

    path("video/<str:videoId>/review/<int:start>/records", views.record_names, name="record_names"),

    #path("load_record/", views.load_record, name="load_record"),
    path("video/<str:videoId>/review/<int:start>/records/<str:record_name>", views.record, name="submit_record"),

    #path("game/<str:tournament_name>/<str:game_name>/cuts", views.upload_cuts, name="upload_cuts"),

    # url(r'^$', 'edit_game_server.views.home', name='home'),
]


