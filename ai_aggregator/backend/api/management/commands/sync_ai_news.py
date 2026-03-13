import requests
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from api.models import AIInsight

class Command(BaseCommand):
    help = "Syncs AI-related news from Hacker News and The News API."

    # Placeholders for API Keys/EndPoints
    NEWS_API_KEY = "YOUR_NEWSAPI_ORG_KEY_HERE" 
    HN_API_URL = "https://hn.algolia.com/api/v1/search?query=AI&tags=story"
    # The URL will be constructed in the handle method to avoid issues with missing keys

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE(">>> Starting AI News Sync..."))

        # 1. Fetch from Hacker News (Algolia)
        self.stdout.write("Fetching from Hacker News...")
        try:
            hn_response = requests.get(self.HN_API_URL, timeout=15)
            hn_response.raise_for_status()
            self.process_hn_data(hn_response.json().get('hits', []))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch from HN: {e}"))

        # 2. Fetch from The News API (NewsAPI.org)
        if self.NEWS_API_KEY == "YOUR_NEWSAPI_ORG_KEY_HERE":
            self.stdout.write(self.style.WARNING("Skipping The News API: Placeholder key detected."))
        else:
            self.stdout.write("Fetching from The News API...")
            NEWS_API_URL = f"https://newsapi.org/v2/everything?q=Artificial Intelligence&sortBy=publishedAt&apiKey={self.NEWS_API_KEY}"
            try:
                newsapi_response = requests.get(NEWS_API_URL, timeout=15)
                newsapi_response.raise_for_status()
                self.process_newsapi_data(newsapi_response.json().get('articles', []))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to fetch from NewsAPI: {e}"))

        self.stdout.write(self.style.SUCCESS("<<< Sync Completed successfully."))

    def process_hn_data(self, hits):
        """Normalize and save Hacker News data."""
        count = 0
        for hit in hits:
            unique_id = f"HN_{hit['objectID']}"
            url = hit.get('url')
            if not url: continue

            if AIInsight.objects.filter(unique_id=unique_id).exists():
                continue

            insight_data = {
                'title': hit.get('title', 'No Title'),
                'url': url,
                'source_name': 'Hacker News',
                'content_preview': hit.get('story_text') or f"Submitted by {hit.get('author')}",
                'published_at': parse_datetime(hit['created_at']) or timezone.now(),
                'unique_id': unique_id
            }
            
            self.save_insight(insight_data)
            count += 1
        self.stdout.write(f"  + Added {count} new items from Hacker News.")

    def process_newsapi_data(self, articles):
        """Normalize and save NewsAPI.org data."""
        count = 0
        for article in articles:
            url = article.get('url')
            if not url: continue
            unique_id = f"NAPI_{abs(hash(url))}"

            if AIInsight.objects.filter(unique_id=unique_id).exists():
                continue

            insight_data = {
                'title': article.get('title', 'No Title'),
                'url': url,
                'source_name': 'The News API',
                'content_preview': article.get('description') or article.get('content'),
                'published_at': parse_datetime(article['publishedAt']) or timezone.now(),
                'unique_id': unique_id
            }
            
            self.save_insight(insight_data)
            count += 1
        self.stdout.write(f"  + Added {count} new items from The News API.")

    def save_insight(self, data):
        """Generic save method with summary placeholder and truncation logic."""
        data['ai_summary'] = self.generate_why_it_matters(data['title'])
        
        try:
            AIInsight.objects.create(**data)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error saving insight: {e}"))

    def generate_why_it_matters(self, title):
        """Placeholder function for future Gemini API summary."""
        return f"[AUTO-INSIGHT]: Analysis currently pending for '{title}'. This update signifies critical progress in neural architecture."
