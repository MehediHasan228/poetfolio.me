from django.db import models

class AIInsight(models.Model):
    """
    Model to store homogenized AI news from multiple sources (Hacker News, NewsAPI).
    """
    title = models.CharField(max_length=500)
    url = models.URLField(max_length=1000, unique=True)
    source_name = models.CharField(max_length=100, help_text="e.g., 'Hacker News' or 'The News API'")
    content_preview = models.TextField(blank=True, null=True)
    published_at = models.DateTimeField()
    unique_id = models.CharField(max_length=255, unique=True, help_text="Unique identifier from the source API")
    ai_summary = models.TextField(blank=True, null=True, help_text="Placeholder for future Gemini API summary")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at']
        verbose_name = "AI Insight"
        verbose_name_plural = "AI Insights"

    def __str__(self):
        return f"[{self.source_name}] {self.title[:50]}..."

    def save(self, *args, **kwargs):
        # Ensure content_preview is always truncated to 150 chars
        if self.content_preview and len(self.content_preview) > 150:
            self.content_preview = self.content_preview[:147] + "..."
        super().save(*args, **kwargs)
