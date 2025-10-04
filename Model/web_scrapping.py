# ====================================================================
# COMPLETE DATA COLLECTION & TRANSFORMATION PIPELINE
# Run this entire cell in Google Colab
# ====================================================================

import praw
import json
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import time

class TataDataPipeline:
    """
    Complete pipeline: Collect → Transform → Save as JSONL
    """
    
    def __init__(self, reddit_client_id, reddit_client_secret, youtube_api_key):
        # Reddit setup
        self.reddit = praw.Reddit(
            client_id=reddit_client_id,
            client_secret=reddit_client_secret,
            user_agent="TataCrisisMonitor/2.0"
        )
        
        # YouTube setup
        self.youtube = build('youtube', 'v3', developerKey=youtube_api_key)
        
        # Sentiment analyzer
        self.vader = SentimentIntensityAnalyzer()
        
        # Aspect keywords
        self.aspects = {
            'performance': ['power', 'acceleration', 'pickup', 'engine', 'torque', 'speed', 'performance'],
            'mileage': ['mileage', 'fuel', 'economy', 'efficiency', 'kmpl', 'consumption'],
            'comfort': ['comfort', 'seat', 'ride', 'suspension', 'smooth', 'spacious', 'space'],
            'features': ['feature', 'infotainment', 'screen', 'technology', 'connectivity', 'sunroof'],
            'quality': ['quality', 'build', 'fit', 'finish', 'material', 'premium'],
            'service': ['service', 'dealer', 'maintenance', 'after-sales', 'workshop', 'aftersales'],
            'price': ['price', 'cost', 'value', 'expensive', 'worth', 'pricing'],
            'design': ['design', 'look', 'style', 'exterior', 'interior', 'appearance']
        }
    
    def analyze_sentiment(self, text):
        """Get sentiment score"""
        if not text or len(text.strip()) < 5:
            return {'label': 'neutral', 'score': 0.0}
        
        scores = self.vader.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            label = 'positive'
        elif compound <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'
        
        return {'label': label, 'score': round(compound, 4)}
    
    def extract_aspects(self, text):
        """Extract aspects mentioned"""
        if not text:
            return []
        
        text_lower = text.lower()
        found_aspects = []
        
        for aspect, keywords in self.aspects.items():
            if any(kw in text_lower for kw in keywords):
                aspect_sentiment = self.analyze_sentiment(text)
                found_aspects.append({
                    'aspect': aspect,
                    'sentiment': aspect_sentiment['label']
                })
        
        return found_aspects
    
    def detect_vehicle_model(self, text):
        """Detect which vehicle is mentioned"""
        text_lower = text.lower()
        
        if 'harrier' in text_lower:
            return 'Tata Harrier'
        elif 'safari' in text_lower:
            return 'Tata Safari'
        else:
            return 'Tata'
    
    def transform_to_format(self, raw_post):
        """Transform raw post to standardized format"""
        content = raw_post.get('content', '')
        
        transformed = {
            'platform': raw_post.get('platform'),
            'source': raw_post.get('source'),
            'post_id': raw_post.get('post_id'),
            'username': raw_post.get('username'),
            'content': content,
            'timestamp': raw_post.get('timestamp'),
            'score': raw_post.get('score', 0),
            'sentiment': self.analyze_sentiment(content),
            'aspects': self.extract_aspects(content),
            'vehicle_model': self.detect_vehicle_model(content)
        }
        
        # Add platform-specific fields
        if raw_post.get('platform') == 'reddit':
            transformed['num_comments'] = raw_post.get('num_comments', 0)
            transformed['url'] = raw_post.get('url', '')
        elif raw_post.get('platform') == 'youtube':
            transformed['video_id'] = raw_post.get('video_id', '')
        
        return transformed
    
    def collect_reddit_posts(self, subreddits, keywords, days_back=7, limit=100):
        """Collect Reddit posts"""
        print(f"📱 Collecting from {len(subreddits)} subreddits...")
        
        all_posts = []
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        
        for sub_name in subreddits:
            sub_count = 0
            
            try:
                subreddit = self.reddit.subreddit(sub_name)
                
                for keyword in keywords:
                    try:
                        posts = subreddit.search(keyword, limit=limit, time_filter='month')
                        
                        for post in posts:
                            post_date = datetime.utcfromtimestamp(post.created_utc)
                            
                            if post_date < cutoff_date:
                                continue
                            
                            # Check for duplicates
                            if any(p['post_id'] == post.id for p in all_posts):
                                continue
                            
                            all_posts.append({
                                'platform': 'reddit',
                                'source': f'r/{sub_name}',
                                'post_id': post.id,
                                'username': str(post.author),
                                'content': f"{post.title} {post.selftext}",
                                'timestamp': post_date.isoformat() + 'Z',
                                'score': post.score,
                                'num_comments': post.num_comments,
                                'url': f"https://reddit.com{post.permalink}"
                            })
                            sub_count += 1
                        
                        time.sleep(0.5)
                        
                    except Exception as e:
                        print(f"  ⚠ Error with '{keyword}': {e}")
                        continue
                
                if sub_count > 0:
                    print(f"  ✓ r/{sub_name}: {sub_count} posts")
                
            except Exception as e:
                print(f"  ✗ r/{sub_name}: {e}")
        
        print(f"✅ Reddit: {len(all_posts)} posts\n")
        return all_posts
    
    def collect_youtube_comments(self, video_searches, max_videos=10, max_comments=100):
        """Collect YouTube comments"""
        print(f"🎥 Collecting from {len(video_searches)} search queries...")
        
        all_comments = []
        
        for search_query in video_searches:
            query_count = 0
            
            try:
                # Search videos
                search_response = self.youtube.search().list(
                    q=search_query,
                    part='id,snippet',
                    maxResults=max_videos,
                    type='video',
                    order='relevance'
                ).execute()
                
                for item in search_response.get('items', []):
                    video_id = item['id']['videoId']
                    video_title = item['snippet']['title']
                    
                    try:
                        # Get comments
                        comments_response = self.youtube.commentThreads().list(
                            part='snippet',
                            videoId=video_id,
                            maxResults=max_comments,
                            textFormat='plainText'
                        ).execute()
                        
                        for comment_item in comments_response.get('items', []):
                            comment = comment_item['snippet']['topLevelComment']['snippet']
                            
                            all_comments.append({
                                'platform': 'youtube',
                                'source': video_title,
                                'post_id': comment_item['id'],
                                'username': comment['authorDisplayName'],
                                'content': comment['textDisplay'],
                                'timestamp': comment['publishedAt'],
                                'score': comment['likeCount'],
                                'video_id': video_id
                            })
                            query_count += 1
                        
                        time.sleep(0.3)
                        
                    except Exception:
                        continue
                
                print(f"  ✓ '{search_query}': {query_count} comments")
                
            except Exception as e:
                print(f"  ✗ '{search_query}': {e}")
        
        print(f"✅ YouTube: {len(all_comments)} comments\n")
        return all_comments
    
    def save_as_jsonl(self, data, filename):
        """Save data as JSONL format (one JSON per line)"""
        print(f"💾 Saving to JSONL format...")
        
        with open(filename, 'w', encoding='utf-8') as f:
            for item in data:
                # Write each item as a single line
                json_line = json.dumps(item, ensure_ascii=False)
                f.write(json_line + '\n')
        
        print(f"✅ Saved {len(data)} items to {filename}")
        
        # Verify file
        line_count = sum(1 for line in open(filename, 'r', encoding='utf-8'))
        print(f"✓ Verified: {line_count} lines in file\n")
    
    def run_pipeline(self, config):
        """Complete pipeline: Collect → Transform → Save"""
        print("="*80)
        print("🚀 TATA DATA COLLECTION & TRANSFORMATION PIPELINE")
        print("="*80)
        print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Step 1: Collect raw data
        print("STEP 1: DATA COLLECTION")
        print("-"*80)
        
        reddit_data = self.collect_reddit_posts(
            subreddits=config['REDDIT_SUBREDDITS'],
            keywords=config['REDDIT_KEYWORDS'],
            days_back=config.get('DAYS_BACK', 7),
            limit=config.get('REDDIT_LIMIT', 100)
        )
        
        youtube_data = self.collect_youtube_comments(
            video_searches=config['YOUTUBE_SEARCHES'],
            max_videos=config.get('YOUTUBE_MAX_VIDEOS', 10),
            max_comments=config.get('YOUTUBE_MAX_COMMENTS', 100)
        )
        
        all_raw_data = reddit_data + youtube_data
        
        print(f"📊 Total raw posts collected: {len(all_raw_data)}\n")
        
        # Step 2: Transform data
        print("STEP 2: DATA TRANSFORMATION")
        print("-"*80)
        print("🔄 Analyzing sentiment and extracting aspects...")
        
        transformed_data = []
        for i, raw_post in enumerate(all_raw_data, 1):
            if i % 50 == 0:
                print(f"  Processing: {i}/{len(all_raw_data)}")
            
            transformed = self.transform_to_format(raw_post)
            transformed_data.append(transformed)
        
        print(f"✅ Transformed {len(transformed_data)} posts\n")
        
        # Step 3: Save as JSONL
        print("STEP 3: SAVING TO JSONL")
        print("-"*80)
        
        filename = f"tata_data.jsonl"
        
        self.save_as_jsonl(transformed_data, filename)
        
        # Step 4: Summary
        print("STEP 4: SUMMARY")
        print("-"*80)
        
        sentiment_counts = {}
        for item in transformed_data:
            label = item['sentiment']['label']
            sentiment_counts[label] = sentiment_counts.get(label, 0) + 1
        
        print(f"📊 Sentiment Distribution:")
        for label, count in sentiment_counts.items():
            print(f"   {label.title()}: {count} ({count/len(transformed_data)*100:.1f}%)")
        
        print(f"\n📁 Output file: {filename}")
        print(f"📏 File size: {len(transformed_data)} lines\n")
        
        print("="*80)
        print("✅ PIPELINE COMPLETED SUCCESSFULLY")
        print("="*80)
        print(f"⏰ Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        return filename, transformed_data


# ====================================================================
# CONFIGURATION
# ====================================================================

CONFIG = {
    # API Credentials - REPLACE WITH YOUR ACTUAL CREDENTIALS
    'REDDIT_CLIENT_ID': '',
    'REDDIT_CLIENT_SECRET': '',
    'YOUTUBE_API_KEY': '',
    
    # Subreddits
    'REDDIT_SUBREDDITS': [
        'CarsIndia',
        'IndianAutoEnthusiasts',
        'india',
        'bangalore',
        'mumbai',
        'delhi',
    ],
    
    # Keywords
    'REDDIT_KEYWORDS': [
        'tata harrier',
        'tata safari',
    ],
    
    # YouTube searches
    'YOUTUBE_SEARCHES': [
        'tata harrier review',
        'tata safari review',
    ],
    
    # Collection settings
    'DAYS_BACK': 30,  # Last 30 days
    'REDDIT_LIMIT': 100,  # Posts per subreddit
    'YOUTUBE_MAX_VIDEOS': 10,
    'YOUTUBE_MAX_COMMENTS': 100,
}


# ====================================================================
# RUN THE PIPELINE
# ====================================================================

def run_pipeline():
    """Main function to run the pipeline"""
    
    # Check if credentials are set
    if CONFIG['REDDIT_CLIENT_ID'] == 'YOUR_REDDIT_CLIENT_ID':
        print("⚠  WARNING: Please update CONFIG with your actual API credentials!")
        print("\nYou need:")
        print("1. Reddit API credentials from: https://www.reddit.com/prefs/apps")
        print("2. YouTube API key from: https://console.cloud.google.com/")
        return None
    
    # Initialize pipeline
    pipeline = TataDataPipeline(
        reddit_client_id=CONFIG['REDDIT_CLIENT_ID'],
        reddit_client_secret=CONFIG['REDDIT_CLIENT_SECRET'],
        youtube_api_key=CONFIG['YOUTUBE_API_KEY']
    )
    
    # Run complete pipeline
    filename, data = pipeline.run_pipeline(CONFIG)
    
    print(f"\n🎉 SUCCESS!")
    print(f"📁 Data saved to: {filename}")
    print(f"📊 Total records: {len(data)}")
    
    return filename, data


# ====================================================================
# EXECUTE
# ====================================================================

# Uncomment the line below to run
filename, data = run_pipeline()