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
        
    print("search", search)
    tables = request.session.get("tables")
    print("tables", tables)
    if request.POST.getlist("choosed"):
        choosed = request.POST.getlist("choosed")
        request.session["choosed"] = choosed
        tables = None
    else:
        choosed = request.session.get("choosed")
        if choosed == None:
            return redirect("home")
        if tables in (None, 'None', ''):
            tables = None

    if tables in (None, 'None', ''):
        def get_courses_pk(item): return int(item.split(" ")[0])
        def get_sections_pk(item): return int(item.split(" ")[1])

        selected_courses = {get_courses_pk(i) for i in choosed}
        selected_sections = [get_sections_pk(i) for i in choosed]

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

        print(sections_permutations)
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

        for state in states:
            print(state)

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
                copy_flag["total_credit"] = total_credit
                if search not in (None, 'None', ''):
                    if total_credit == int(search):
                        copy_flag["informations"] = informations
                        tables.append(copy_flag)
                else:
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
    
    print("len : ", len(tables))

    for x in tables:
        print("x :", x)
        print()
    
    paginator = Paginator(tables, 1)
    page_number = request.GET.get('page')
    tables = paginator.get_page(page_number)
    return render(request, "suggest.html", {
        "search": search,
        "tables": tables,
        "message": message
    })



@login_required(login_url='/accounts/login/')
def addFavourite(request):
    if request.method == 'POST':
        var = dict(request.POST)
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
    error = False
    tables = []

    for fav in favourites:

        favourite_courses_pk = [int(pk) for pk in fav.courses_pk.split(" ")]
        favourite_sections_pk = [int(pk) for pk in fav.sections_pk.split(" ")]

        courses_name = Course.objects.filter(pk__in=favourite_courses_pk)
        sections = []
        tot_credits = 0

        if len(favourite_courses_pk) != len(list(courses_name)):
            Favourite.objects.filter(owner=request.user, pk=fav.pk).delete()
            error = True
            continue

        for course in courses_name:
            course_sections = Section.objects.filter(
                course=course, pk__in=favourite_sections_pk)
            
            if len(list(course_sections)) != 1:
                Favourite.objects.filter(
                    owner=request.user, pk=fav.pk).delete()
                error = True
                break
            
            course_sections_info = []
            tot_credits += course.credits

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

        if error:
            continue

        state = [[1] for _ in range(len(favourite_sections_pk))]

        copy_flag = deepcopy(flag)
        informations = []
        possiblie = True

        for i, element in enumerate(state):

            section = sections[i][0]
            times = section["time"]

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
        
        if not possiblie:
            error = True
            Favourite.objects.filter(owner=request.user, pk=fav.pk).delete()
            continue
        
        informations.sort(
            key=lambda item: item["exam_date"], reverse=False)

        for i in range(len(informations)-1):
            if informations[i]["exam_date"] == "0":
                continue
            if informations[i]["exam_date"] == informations[i+1]["exam_date"]:
                informations[i]["exam_conflict"] = True
                informations[i+1]["exam_conflict"] = True

        copy_flag["total_credit"] = tot_credits
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
