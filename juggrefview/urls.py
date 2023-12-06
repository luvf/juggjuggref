from django.urls import path
from . import views


app_name = "juggrefview"
urlpatterns = [
    path("", views.basejugref, name="ref_tool"),

    path("submit_record/<str:video_url>/", views.submit_record, name="submit_record"),
    #path("record_names", views.record_names, name="record_names"),
    path("record_names/<str:video_url>/", views.record_names, name="record_names"),

    #path("load_record/", views.load_record, name="load_record"),
    path("load_record/<str:video_url>/<str:position>/<str:record_name>/", views.load_record, name="load_record"),

    #path("game/<str:tournament_name>/<str:game_name>/cuts", views.upload_cuts, name="upload_cuts"),


    # url(r'^$', 'edit_game_server.views.home', name='home'),
]


