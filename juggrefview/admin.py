from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ["name", "video_id"]


@admin.register(PointReview)
class PointReviewAdmin(admin.ModelAdmin):
    list_display = ["game", "start", "end"]



@admin.register(RefView)
class RefAdmin(admin.ModelAdmin):
    list_display = ["name", "author",  "position", "point_reviewed", "length_json_record"]

    @admin.display(empty_value="???")
    def length_json_record(self, obj):
        return len(obj.json_record["mouse_pos"])