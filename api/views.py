import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers

from unit_selection.models import Departemant

class HomeApiView(APIView):

    def get(self, request):
        departemants = {}
        for departemant in Departemant.objects.all():
            departemants[f"{departemant.name}"] = json.loads(serializers.serialize('json', departemant.courses.filter(
                status=True).order_by("-credits", "name")))

        print(departemants)
        notice = request.session.get("notice")
        return Response(departemants)
