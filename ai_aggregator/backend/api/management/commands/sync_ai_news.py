import requests
import re
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from api.models import AIInsight

class Command(BaseCommand):
    help = "Syncs AI and Tech news from Hacker News and The News API with strict filtering."

    # Placeholders for API Keys/EndPoints
    NEWS_API_KEY = "YOUR_NEWSAPI_ORG_KEY_HERE" 
    HN_API_URL = "https://hn.algolia.com/api/v1/search?query=AI&tags=story"
    
    # Keywords for relevance filtering
    TECH_KEYWORDS = [
        'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'neural', 
        'robot', 'automation', 'software', 'coding', 'developer', 'gpu', 'nvidia', 
        'deep learning', 'transformer', 'agent', 'silicon', 'tech', 'computing'
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing insights before syncing',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING("Clearing existing insights..."))
            AIInsight.objects.all().delete()

        self.stdout.write(self.style.NOTICE(">>> Starting AI/Tech News Sync..."))

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
            NEWS_API_URL = f"https://newsapi.org/v2/everything?q=(Artificial Intelligence OR Tech News OR Machine Learning)&sortBy=publishedAt&language=en&apiKey={self.NEWS_API_KEY}"
            try:
                newsapi_response = requests.get(NEWS_API_URL, timeout=15)
                newsapi_response.raise_for_status()
                self.process_newsapi_data(newsapi_response.json().get('articles', []))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to fetch from NewsAPI: {e}"))

        self.stdout.write(self.style.SUCCESS("<<< Sync Completed successfully."))

    def is_relevant(self, title, content):
        """Check if article is relevant to AI/Tech using simple keyword matching."""
        text = f"{title} {content}".lower()
        # Filter out sensitive/unrelated political keywords to reduce noise
        noise_keywords = ['war', 'casualty', 'massacre', 'bombing', 'gaza', 'israel', 'palestine']
        if any(noise in text for noise in noise_keywords):
            return False
            
        return any(re.search(r'\b' + re.escape(kw) + r'\b', text) for kw in self.TECH_KEYWORDS)

    def process_hn_data(self, hits):
        """Normalize and save Hacker News data."""
        count = 0
        for hit in hits:
            title = hit.get('title', 'No Title')
            preview = hit.get('story_text') or f"Submitted by {hit.get('author')}"
            
            if not self.is_relevant(title, preview):
                continue

            unique_id = f"HN_{hit['objectID']}"
            url = hit.get('url')
            if not url: continue

            if AIInsight.objects.filter(unique_id=unique_id).exists():
                continue

            insight_data = {
                'title': title,
                'url': url,
                'source_name': 'Hacker News',
                'content_preview': preview,
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
            title = article.get('title', 'No Title')
            preview = article.get('description') or article.get('content') or ""
            
            if not self.is_relevant(title, preview):
                continue

            url = article.get('url')
            if not url: continue
            unique_id = f"NAPI_{abs(hash(url))}"

            if AIInsight.objects.filter(unique_id=unique_id).exists():
                continue

            insight_data = {
                'title': title,
                'url': url,
                'source_name': 'The News API',
                'content_preview': preview,
                'published_at': parse_datetime(article['publishedAt']) or timezone.now(),
                'unique_id': unique_id
            }
            
            self.save_insight(insight_data)
            count += 1
        self.stdout.write(f"  + Added {count} new items from The News API.")

    def save_insight(self, data):
        """Generic save method with summary placeholder."""
        data['ai_summary'] = self.generate_why_it_matters(data['title'])
        
        try:
            AIInsight.objects.create(**data)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error saving insight: {e}"))

    def generate_why_it_matters(self, title):
        """Placeholder function for future Gemini API summary."""
        return f"This tech update signifies critical progress in neural architecture and digital transformation sector. Analysis: Highly Relevant."
