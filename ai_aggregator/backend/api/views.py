from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.management import call_command
from .models import AIInsight
from .serializers import AIInsightSerializer

class AIInsightListView(APIView):
    def get(self, request):
        insights = AIInsight.objects.all()
        serializer = AIInsightSerializer(insights, many=True)
        return Response(serializer.data)

class AIInsightSyncView(APIView):
    def post(self, request):
        try:
            call_command('sync_ai_news')
            return Response({"message": "Sync completed successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
