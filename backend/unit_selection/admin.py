from django.contrib import admin
from .models import Course, Departemant, Section, Time_Slot, Instructor, Favourite, Group
import nested_admin

class Time_SlotInline(nested_admin.NestedStackedInline):
    model = Time_Slot
    extra = 0

class SectionInline(nested_admin.NestedStackedInline):
    model = Section
    inlines = [Time_SlotInline]
    extra = 0

class CourseAdmin(nested_admin.NestedModelAdmin):
    inlines = [
        SectionInline,
    ]
    list_display = ("name", "group", "credits", "status")
    list_filter = ("group", "credits", "status")
    search_fields = ["name"]

    actions = ['make_visible', 'make_hidden']


    @admin.action(description='Make Visisble')
    def make_visible(modeladmin, request, queryset):
        queryset.update(status=True)

    @admin.action(description='Make hidden')
    def make_hidden(modeladmin, request, queryset):
        queryset.update(status=False)


class InstructorAdmin(admin.ModelAdmin):
    list_display = ("name", "departemant",)
    list_filter = ("departemant",)
    search_fields = ["name"]



class SectionAdmin(admin.ModelAdmin):
#     inlines = [
#         Time_SlotInline,
#     ]
    list_display = ("course", "group", "instructor", "gender",)
    list_filter = ("course", "instructor", "gender",)
    search_fields = ["course", "instructor",]

class Time_SlotAdmin(admin.ModelAdmin):
    list_display = ("section", "day", "start", "end",)
    list_filter = ("day",)
    search_fields = ["section", "day",]


admin.site.register(Departemant)
admin.site.register(Group)
admin.site.register(Favourite)
admin.site.register(Instructor, InstructorAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Section, SectionAdmin)
admin.site.register(Time_Slot, Time_SlotAdmin)