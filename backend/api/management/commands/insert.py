import os
from pathlib import Path
from django.core.management.base import BaseCommand
from bs4 import BeautifulSoup
import re

from unit_selection.models import Departemant, Course, Section, Instructor, Time_Slot, Group
from django.conf import settings

class Command(BaseCommand):
    help = 'Add data'

    def add_arguments(self, parser):
        parser.add_argument('Department', type=str, help='Indicates the number of users to be created')

    def handle(self, *args, **kwargs):
        basepath = os.path.join(settings.BASE_DIR, "data")
        for entry in os.listdir(basepath):
            if kwargs['Department'] == "0":
                pass
            elif not kwargs['Department'] == entry[:len(entry)-5]:
                continue
            if os.path.isfile(os.path.join(basepath, entry)):
                fixture_path = Path(os.path.join(basepath, entry))
                with open(fixture_path) as fp:
                    soup = BeautifulSoup(fp, "html.parser")
                    sections = soup.find_all("tr")[1:]

                    for item in sections:
                        item = BeautifulSoup(str(item))
                        item = item.find_all("td")
                        item = {
                            "department_code": item[0].text,
                            "department_name": item[1].text, 
                            "department_group": item[3].text, 
                            "section_code": item[4].text, 
                            "course_name": item[5].text, 
                            "credit":    item[6].text, 
                            "gender": item[11].text, 
                            "instructor": item[12].text,
                            "exam_date": ''.join(re.sub(' +', ' ',item[13].text).splitlines()),
                            "exam_time": ''.join(re.sub(' +', ' ',item[13].text).splitlines()),
                            "time_slots": ''.join(re.sub(' +', ' ',item[13].text).splitlines()),
                        }
                        exam_date_pattern = r'امتحان\((\d{4}\.\d{2}\.\d{2})\)'

                        match = re.search(exam_date_pattern, item["exam_date"])
                        if match:
                            item["exam_date"] = match.group(1)
                        else:
                            item["exam_date"] = "0"
    
                        
                        exam_time_pattern = r'ساعت : (\d{2}:\d{2}-\d{2}:\d{2})|ساعت :(\d{2}:\d{2}-\d{2}:\d{2})|ساعت: (\d{2}:\d{2}-\d{2}:\d{2})'
                        match = re.search(exam_time_pattern, item["exam_time"])
                        if match:
                            item["exam_time"] = match.group(1) or match.group(2) or match.group(3)
                        else:
                            item["exam_time"] = "0"
                        
                        exam_time_mapping = {
                            "08:00": "8",
                            "08:30": "8.5",
                            "09:00": "9",
                            "09:30": "9.5",
                            "10:00": "10",
                            "10:30": "10.5",
                            "11:00": "11",
                            "11:30": "11.5",
                            "12:00": "12",
                            "12:30": "12.5",
                            "13:00": "13",
                            "13:30": "13.5",
                            "14:00": "14",
                            "14:30": "14.5",
                            "15:00": "15",
                            "15:30": "15.5",
                            "16:00": "16",
                            "16:30": "16.5",
                            "17:00": "17",
                            "17:30": "17.5",
                        }
                        if item["exam_time"] != "0":
                            # print(item["exam_time"])
                            start, end = item["exam_time"].split("-")
                            if start in exam_time_mapping:
                                start = exam_time_mapping[start]
                            if end in exam_time_mapping:
                                end = exam_time_mapping[end]
                                
                            item["exam_time"] = f"{start}-{end}"

                        pattern = r'(شنبه|يك شنبه|دوشنبه|سه شنبه|چهارشنبه) (\d{2}:\d{2}-\d{2}:\d{2})'
                        matches = re.findall(pattern, item["time_slots"])
                        if matches:
                            time_slots = []
                            for match in matches:
                                day = match[0]
                                start, end = match[1].split("-")
                                time_slots.append({"day": day, "start":start, "end": end})
                            item["time_slots"] = time_slots
                        else:
                            # print(item)
                            pass
                            # print("عبارت مورد نظر یافت نشد.")
                        
                        departemant, created = Departemant.objects.get_or_create(name=item["department_name"])
                        group, created = Group.objects.get_or_create(name=item["department_group"], departemant=departemant)
                        instructor, created = Instructor.objects.get_or_create(name=item["instructor"], departemant=departemant)

                        course, created = Course.objects.get_or_create(name=item["course_name"],
                                                                       group=group)
                        course.credits = item["credit"]
                        course.status = True
                        course.exam_date = item["exam_date"]
                        course.exam_time = item["exam_time"]
                        course.save()
                        
                        section = Section.objects.filter(course=course,
                                                         code=item["section_code"])
                        if section.exists():
                            section=section.first()
                            section.instructor = instructor
                            section.gender = item["gender"]
                            section.save()
                        else:
                            section = Section.objects.create(course=course,
                                                             instructor=instructor,
                                                             gender=item["gender"],
                                                             code=item["section_code"])

                        start_choices_mapping = {
                            "08:00": "8",
                            "10:00": "10",
                            "13:30": "13.5",
                            "15:30": "15.5",
                            "17:30": "17.5",
                        }
                        end_choices_mapping = {
                            "09:30": "9.5",
                            "10:00": "9.5",
                            "11:30": "11.5",
                            "12:00": "11.5",
                            "15:00": "15",
                            "15:30": "15",
                            "17:00": "17",
                            "17:30": "17",
                            "19:00": "19",
                            "19:30": "19",
                        }
                        day_choices_mapping = {
                            "شنبه": "شنبه",
                            "يك شنبه": "یکشنبه",
                            "دوشنبه": "دوشنبه",
                            "سه شنبه": "سه‌شنبه",
                            "چهارشنبه": "چهارشنبه",
                        }
                        # print(section)
                        time = list(Time_Slot.objects.filter(section=section))
                        # print(list(time))

                        for i, time_slot in enumerate(item["time_slots"]):
                            if time_slot["start"] in start_choices_mapping:
                                time_slot["start"] = start_choices_mapping[time_slot["start"]]
                            
                            if time_slot["end"] in end_choices_mapping:
                                time_slot["end"] = end_choices_mapping[time_slot["end"]]

                            if time_slot["day"] in day_choices_mapping:
                                time_slot["day"] = day_choices_mapping[time_slot["day"]]
                            
                            if len(time) > i:
                                time[i].day = time_slot["day"]
                                time[i].start = time_slot["start"]
                                time[i].end = time_slot["end"]
                                time[i].save()
                            else:
                                Time_Slot.objects.create(section=section,
                                                        day=time_slot["day"],
                                                        start=time_slot["start"],
                                                        end=time_slot["end"])
                    fp.close()
        
        self.stdout.write("Success !")