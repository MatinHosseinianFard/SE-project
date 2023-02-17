import json
from copy import copy, deepcopy
from itertools import permutations
from django.views.generic import TemplateView
from django.shortcuts import render
from django.core.paginator import Paginator
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

from .models import Section, Course, Departemant, Favourite

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

class AboutPageView(TemplateView):
    template_name = "about.html"


@login_required(login_url='/accounts/login/')
def HomePage(request):
    departemants = []
    for item in Departemant.objects.all():
        d = {}
        d["name"] = item.name
        d["courses"] = item.courses.filter(
            status=True).order_by("-credits", "name")
        departemants.append(d)
    notice = request.session.get("notice")
    return render(request, "home.html", {
        "departemants": departemants,
        "notice": notice
    })


@login_required(login_url='/accounts/login/')
def Suggest(request):

    search = request.GET.get("search")
    if search not in (None, 'None', '') and not search.isdigit():
        search = None
    tables = request.session.get("tables")
    if request.POST.getlist("choosed"):
        choosed = request.POST.getlist("choosed")
        request.session["choosed"] = choosed
        tables = None
    else:
        choosed = request.session.get("choosed")
        if choosed == None:
            return redirect("home")
        if tables in (None, 'None', '',):
            tables = None
    if tables in (None, 'None', '',):

        def get_courses_pk(item): return int(item.split(" ")[0])
        def get_sections_pk(item): return int(item.split(" ")[1])

        courses_choosed = {get_courses_pk(i) for i in choosed}
        sections_choosed = [get_sections_pk(i) for i in choosed]

        courses_name = Course.objects.filter(pk__in=courses_choosed)
        min_credit = 0
        courses = []
        for course in courses_name:
            sections = Section.objects.filter(
                course=course, pk__in=sections_choosed)
            dic_list = []
            min_credit += course.credits
            for section in sections:
                dic = {}
                dic["name"] = f"{course.name}"
                dic["instructor"] = section.instructor.name
                dic["credit"] = course.credits
                dic["code"] = section.code
                dic["gender"] = section.gender
                dic["exam_date"] = course.exam_date
                dic["exam_time"] = course.exam_time
                dic["time"] = [
                    f"{time.day} {time.start}-{time.end}" for time in section.times.all()]
                dic_list.append(dic)
                dic["course_pk"] = course.pk
                dic["section_pk"] = section.pk
            courses.append(dic_list)

        if min_credit < 12:
            request.session["notice"] = True
            return redirect("home")
        request.session["notice"] = False
        courses_flag = []
        for value in courses:
            if len(value) == 1:
                courses_flag.append([[1], [0]])
            else:
                l = []
                s = set(permutations(
                    [1 if z == 0 else 0 for z in range(len(value))]))
                s.add(tuple([0 for _ in range(len(value))]))
                for j in s:
                    l.append(list(j))
                courses_flag.append(l)
        states = []

        def func(lis, z, i, n):
            for j in lis[i]:
                z.append(j)
                if i != n - 1:
                    z = func(lis, z, i + 1, n)
                else:
                    states.append(copy(z))
                z.pop()
            return z

        for i in courses_flag[0]:
            z = [i]
            func(courses_flag, z, 1, courses_name.count())
        
        tables = []
        n = len(states[0])
        for state in states:
            informations = []
            copy_flag = deepcopy(flag)
            total_credit = 0
            possiblie = True
            for i, element in enumerate(state):
                if not total_credit + ((n-i)*3) >= 12:
                    break
                if len(element) == 1:
                    if element[0] == 1:
                        section = courses[i][0]
                        total_credit += section["credit"]
                        times = section["time"]
                    else:
                        continue
                else:
                    try:
                        element_index = element.index(1)
                        section = courses[i][element_index]
                        total_credit += section["credit"]
                        times = section["time"]
                    except:
                        continue

                for time in times:
                    day, section_time = time.split(" ")
                    if not copy_flag[day][section_time]:
                        # copy_flag[day][section_time] = "{}".format(
                        #     section["name"])
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
                    informations[i]["exam_conflict"] = True
                    informations[i+1]["exam_conflict"] = True
                    if informations[i]["exam_time"] == informations[i+1]["exam_time"]:
                        possiblie = False
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
    paginator = Paginator(tables, 1)
    page_number = request.GET.get('page')
    tables = paginator.get_page(page_number)
    # print(tables[0])
    return render(request, "suggest.html", {
        "tables": tables,
        "search": search,
        "message": message
    })


@login_required(login_url='/accounts/login/')
def addFavourite(request):
    if request.method == 'POST':
        var = dict(request.POST)
        # print(var)
        courses_pk = ""
        sections_pk = ""
        count = (len(var)-27)//10
        for i in range(count):
            course_pk = var["task[informations][%s][course_pk]" % i].pop()
            section_pk = var["task[informations][%s][section_pk]" % i].pop()
            courses_pk += course_pk + " "
            sections_pk += section_pk + " "

        courses_pk = courses_pk.strip()
        sections_pk = sections_pk.strip()
        obj = list(Favourite.objects.filter(owner=request.user,
                   courses_pk=courses_pk, sections_pk=sections_pk))
        if len(obj) == 0:
            Favourite.objects.create(
                owner=request.user, courses_pk=courses_pk, sections_pk=sections_pk)

        return HttpResponse(status=200)

    return HttpResponse(status=400)


@login_required(login_url='/accounts/login/')
def seeFavourite(request):
    favourites = Favourite.objects.filter(owner=request.user)
    tables = []
    error = False
    for fav in favourites:
        courses_pk = [int(pk) for pk in fav.courses_pk.split(" ")]
        sections_pk = [int(pk) for pk in fav.sections_pk.split(" ")]
        courses_name = Course.objects.filter(pk__in=courses_pk)
        courses = []
        tot_credist = 0
        if len(courses_pk) != len(list(courses_name)):
            error = True
            Favourite.objects.filter(owner=request.user, pk=fav.pk).delete()
            continue
        for course in courses_name:
            sections = Section.objects.filter(
                course=course, pk__in=sections_pk)
            if len(list(sections)) != 1:
                error = True
                Favourite.objects.filter(owner=request.user, pk=fav.pk).delete()
                break
            dic_list = []
            tot_credist += course.credits
            for section in sections:
                dic = {}
                dic["name"] = f"{course.name}"
                dic["instructor"] = section.instructor.name
                dic["credit"] = course.credits
                dic["code"] = section.code
                dic["gender"] = section.gender
                dic["exam_date"] = course.exam_date
                dic["exam_time"] = course.exam_time
                dic["time"] = [
                    f"{time.day} {time.start}-{time.end}" for time in section.times.all()]
                dic["course_pk"] = course.pk
                dic["section_pk"] = section.pk
                dic_list.append(dic)
            courses.append(dic_list)

        if error:
            continue
        state = [[1] for _ in range(len(sections_pk))]

        informations = []
        copy_flag = deepcopy(flag)
        possiblie = True
        for i, element in enumerate(state):
            
            section = courses[i][0]
            times = section["time"]

            for time in times:
                day, section_time = time.split(" ")
                if not copy_flag[day][section_time]:
                        # copy_flag[day][section_time] = "{}".format(
                        #     section["name"])
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
        if not possiblie:
                error = True
                Favourite.objects.filter(owner=request.user, pk=fav.pk).delete()
                continue
        informations.sort(
            key=lambda item: item["exam_date"], reverse=False)
        informations.sort(
                key=lambda item: item["exam_date"], reverse=False)
        for i in range(len(informations)-1):
            if informations[i]["exam_date"] == "0":
                    continue
            if informations[i]["exam_date"] == informations[i+1]["exam_date"]:
                informations[i]["exam_conflict"] = True
                informations[i+1]["exam_conflict"] = True
        copy_flag["total_credit"] = tot_credist
        copy_flag["informations"] = informations
        copy_flag["favourite_pk"] = fav.pk
        tables.append(copy_flag)

        tables = sorted(
            tables, key=lambda item: item["total_credit"], reverse=True)
    if len(tables) == 0:
        notice = True
    else:
        notice = False
    paginator = Paginator(tables, 1)
    page_number = request.GET.get('page')
    tables = paginator.get_page(page_number)
    return render(request, "favourite.html", {
        "tables": tables,
        "notice": notice,
        "error": error
    })


@login_required(login_url='/accounts/login/')
def removeFavourite(request):
    if request.method == 'POST':
        var = dict(request.POST)
        pk = int(var["task[favourite_pk]"].pop())
        Favourite.objects.filter(pk=pk).delete()
        return HttpResponse(status=204)
    return HttpResponse(status=201)