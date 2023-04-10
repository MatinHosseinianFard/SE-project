from . import serializers
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
from copy import deepcopy
from django.core.paginator import Paginator
from django.shortcuts import render, redirect
from itertools import permutations
from rest_framework.decorators import api_view
from django.http import HttpResponse
from .serializers import CustomTokenObtainPairSerializer
from unit_selection.models import Favourite


from rest_framework_simplejwt.views import TokenObtainPairView


from unit_selection.models import Departemant, Course, Section

flag = {
    "شنبه": {
        "8-9.5": False,
        "10-11.5": False,
        "13.5-15": False,
        "15.5-17": False,
        "17.5-19": False,
    },
    "یکشنبه": {
        "8-9.5": False,
        "10-11.5": False,
        "13.5-15": False,
        "15.5-17": False,
        "17.5-19": False,
    },
    "دوشنبه": {
        "8-9.5": False,
        "10-11.5": False,
        "13.5-15": False,
        "15.5-17": False,
        "17.5-19": False,
    },
    "سشنبه": {
        "8-9.5": False,
        "10-11.5": False,
        "13.5-15": False,
        "15.5-17": False,
        "17.5-19": False,
    },
    "چهارشنبه": {
        "8-9.5": False,
        "10-11.5": False,
        "13.5-15": False,
        "15.5-17": False,
        "17.5-19": False,
    },
    "total_credit": 0,
    "informations": []
}


class CustomTokenObtainPairView(TokenObtainPairView):
    # Replace the serializer with your custom
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
def home(request):
    departemants = {
        departemant.name: json.loads(serializers.serialize(
            'json', departemant.courses.filter(status=True).order_by("-credits", "name")))
        for departemant in Departemant.objects.all()
    }
    departemants["notice"] = request.session.get("notice")
    return Response(departemants)


@api_view(['GET', 'POST'])
def suggest(request):
    search = request.GET.get("search")
    if search not in (None, 'None', '') and not search.isdigit():
        search = None

    tables = request.session.get("tables")

    """
        request body:
        {
        "choosed":
            {"selected_courses": "29 16 14 17",
            "selected_sections": "122 67 64 68"
            }
        }
    """
    print(request.data.get("choosed"))
    # if request.POST.getlist("choosed"):
    if request.data.get("choosed"):
        # choosed = request.POST.getlist("choosed")
        choosed = request.data.get("choosed")
        request.session["choosed"] = choosed
        tables = None
    else:
        choosed = request.session.get("choosed")
        if choosed == None:
            return redirect("home")
        if tables in (None, 'None', ''):
            tables = None
    print(choosed["selected_courses"])
    if tables in (None, 'None', ''):
        # def get_courses_pk(item): return int(item.split(" "))
        # def get_sections_pk(item): return int(item.split(" "))

        selected_courses = {int(i) for i in choosed["selected_courses"].split(" ")}
        selected_sections = [int(i) for i in choosed["selected_sections"].split(" ")]

        courses_name = Course.objects.filter(pk__in=selected_courses)
        min_credit = 0
        sections = []
        for course in courses_name:
            course_sections = Section.objects.filter(
                course=course, pk__in=selected_sections)
            min_credit += course.credits
            course_sections_info = []
            for section in course_sections:
                section_info = {
                    "name": str(course.name),
                    "instructor": section.instructor.name,
                    "credit": course.credits,
                    "code": section.code,
                    "gender": section.gender,
                    "exam_date": course.exam_date,
                    "exam_time": course.exam_time,
                    "time": [
                        f"{time.day} {time.start}-{time.end}" for time in section.times.all()],
                    "course_pk": course.pk,
                    "section_pk": section.pk
                }
                course_sections_info.append(section_info)

            sections.append(course_sections_info)

        if min_credit < 12:
            request.session["notice"] = True
            return redirect("home")
        else:
            request.session["notice"] = False

        sections_permutations = []

        for section in sections:
            lis = [0 for _ in range(len(section)-1)] + [1]

            s = set(permutations(lis))
            s.add(tuple([0 for _ in range(len(section))]))

            sections_permutations.append([list(i) for i in s])

        states = []

        def state_generator(lis, state, i, n):
            for j in lis[i]:
                state.append(j)
                if i != n - 1:
                    state = state_generator(lis, state, i + 1, n)
                else:
                    states.append(deepcopy(state))
                state.pop()
            return state

        state_generator(sections_permutations, [], 0, courses_name.count())

        tables = []
        n = courses_name.count()
        for state in states:
            informations = []
            copy_flag = deepcopy(flag)
            total_credit = 0
            possiblie = True
            for i, section in enumerate(state):
                if not total_credit + ((n-i)*3) >= 12:
                    break
                elif len(section) == 1:
                    if section[0] == 1:
                        section = sections[i][0]
                        total_credit += section["credit"]
                        times = section["time"]
                    else:
                        continue
                else:
                    try:
                        section_index = section.index(1)
                        section = sections[i][section_index]
                        total_credit += section["credit"]
                        times = section["time"]
                    except:
                        continue

                for time in times:
                    day, section_time = time.split(" ")
                    if not copy_flag[day][section_time]:
                        copy_flag[day][section_time] = "{}".format(
                            section["name"] if len(section["name"]) <= 30 else section["name"][:30]+"..")
                    else:
                        possiblie = False
                        break

                if not possiblie:
                    break

                informations.append(
                    {
                        "name": section["name"],
                        "instructor": section["instructor"],
                        "code": section["code"],
                        "group": section["code"][-2:],
                        "gender": section["gender"],
                        "credit": section["credit"],
                        "exam_date": section["exam_date"],
                        "exam_time": section["exam_time"],
                        "course_pk": section["course_pk"],
                        "section_pk": section["section_pk"],
                        "exam_conflict": False
                    },
                )
            informations.sort(
                key=lambda item: item["exam_date"], reverse=False)

            for i in range(len(informations)-1):
                if informations[i]["exam_date"] == "0":
                    continue
                if informations[i]["exam_date"] == informations[i+1]["exam_date"]:
                    if informations[i]["exam_time"] == informations[i+1]["exam_time"]:
                        possiblie = False
                        break
                    informations[i]["exam_conflict"] = True
                    informations[i+1]["exam_conflict"] = True

            if possiblie and total_credit >= 12:
                if search not in (None, 'None', ''):
                    if total_credit == int(search):
                        copy_flag["total_credit"] = total_credit
                        copy_flag["informations"] = informations
                        tables.append(copy_flag)
                else:
                    copy_flag["total_credit"] = total_credit
                    copy_flag["informations"] = informations

                    tables.append(copy_flag)

        tables = sorted(
            tables, key=lambda item: item["total_credit"], reverse=True)
        request.session["tables"] = tables

    elif search not in (None, 'None', ''):
        tables = list(
            filter(lambda item: item["total_credit"] == int(search), tables))
        message = False

    message = False
    if len(tables) == 0:
        if search in (None, 'None', ''):
            message = "برنامه ای با این دروس امکان پذیر نیست"
        else:
            message = "برنامه ای با این دروس و تعداد واحد مدنظر وجود ندارد"
    tables.append({"message": message})
    return Response(tables)

@api_view(['GET', 'POST'])
def addFavourite(request):
    if request.method == 'POST':
        courses_pk = request.data.get("selected_courses")
        sections_pk = request.data.get("selected_sections")
        obj = list(Favourite.objects.filter(owner=request.user,
                   courses_pk=courses_pk, sections_pk=sections_pk))
        if len(obj) == 0:
            Favourite.objects.create(
                owner=request.user, courses_pk=courses_pk, sections_pk=sections_pk)

        return HttpResponse(status=200)

    return HttpResponse(status=400)