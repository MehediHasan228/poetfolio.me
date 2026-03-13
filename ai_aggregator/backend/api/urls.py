from django.urls import path
from .views import AIInsightListView, AIInsightSyncView

urlpatterns = [
    path('insights/', AIInsightListView.as_view(), name='insight-list'),
    path('insights/sync/', AIInsightSyncView.as_view(), name='insight-sync'),
]
