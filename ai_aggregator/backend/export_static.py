import os
import json
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import AIInsight
from django.core.serializers.json import DjangoJSONEncoder

def export_to_json():
    # Fetch all insights
    insights = AIInsight.objects.all().values(
        'title', 'url', 'source_name', 'content_preview', 
        'published_at', 'unique_id', 'ai_summary'
    )
    
    # Convert list of dicts to list
    insights_list = list(insights)
    
    # Define output path (React public directory)
    output_path = os.path.join('..', 'frontend', 'public', 'data.json')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(insights_list, f, indent=4, cls=DjangoJSONEncoder)
    
    print(f"Successfully exported {len(insights_list)} insights to {output_path}")

if __name__ == "__main__":
    export_to_json()
