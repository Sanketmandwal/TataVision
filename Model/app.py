
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import requests
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Tata Motors Competitive Intelligence API",
    description="AI-powered competitive analysis for Tata Harrier & Safari",
    version="2.0.0"
)

# Add CORS middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Specific origins
    allow_credentials=True,
    allow_methods=["*"],            # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],            # Allow all headers
)

# Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
TATA_INDEX_NAME = "tata-motors-sentiment"
COMPETITOR_INDEX_NAME = "competitors-sentiment"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.0-flash-exp"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
HEADERS = {"Content-Type": "application/json"}

# Competitor mapping
COMPETITOR_MAPPING = {
    "safari": ["Mahindra XUV700", "Hyundai Alcazar", "MG Hector Plus"],
    "harrier": ["Jeep Compass", "MG Hector", "Hyundai Tucson"],
}

# Validate API keys
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY not found in .env file")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# Initialize services
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    tata_index = pc.Index(TATA_INDEX_NAME)
    competitor_index = pc.Index(COMPETITOR_INDEX_NAME)
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    logger.info("Successfully initialized all services")
except Exception as e:
    logger.error(f"Initialization error: {e}")
    raise

# ========== Pydantic Models ==========

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 10

class FeedbackItem(BaseModel):
    content: str
    location: str
    sentiment: str
    score: float
    brand: Optional[str] = None

class SentimentStats(BaseModel):
    positive: int
    negative: int
    neutral: int
    total: int
    positive_pct: float
    negative_pct: float
    neutral_pct: float

class CompetitorAnalysis(BaseModel):
    name: str
    feedback_count: int
    sentiment_stats: SentimentStats
    sample_feedback: List[FeedbackItem]

class AnalysisResponse(BaseModel):
    success: bool
    query: str
    tata_vehicle: str
    competitors_analyzed: List[str]
    
    # Tata data
    tata_feedback_count: int
    tata_sentiment_stats: SentimentStats
    tata_sample_feedback: List[FeedbackItem]
    
    # Competitor data
    competitor_analysis: List[CompetitorAnalysis]
    
    # AI Analysis
    comprehensive_analysis: str
    
    # Metadata
    filters_applied: Dict
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    tata_index: Dict
    competitor_index: Dict
    available_vehicles: List[str]
    competitor_mapping: Dict

# ========== Helper Functions ==========

def call_gemini(prompt: str, max_tokens: int = 200, temperature: float = 0.7) -> Optional[str]:
    """Call Gemini API with error handling"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature
        }
    }
    
    try:
        response = requests.post(GEMINI_ENDPOINT, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()
        response_json = response.json()
        
        if "candidates" not in response_json:
            logger.error(f"No candidates in response: {response_json}")
            return None
            
        return response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
        
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None

def clean_json_response(text: str) -> str:
    """Clean markdown from JSON response"""
    text = text.strip()
    if text.startswith("json"):
        text = text[7:]
    elif text.startswith(""):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def identify_vehicle_and_competitors(user_query: str) -> Dict:
    """Identify which Tata vehicle and competitors to analyze"""
    prompt = f"""
You are analyzing a query about Tata Motors vehicles. Only respond about Tata Harrier or Tata Safari.

User query: "{user_query}"

Available Tata vehicles and their competitors:
- Safari: competes with Mahindra XUV700, Hyundai Alcazar, MG Hector Plus
- Harrier: competes with Jeep Compass, MG Hector, Hyundai Tucson

Analyze the query and return JSON with:
- "tata_vehicle": "safari" or "harrier" (detect from query, default to "safari" if unclear)
- "competitors": list of competitor names (use default competitors unless user specifies)
- "embedding_query": semantic search text focusing on the vehicle and aspects mentioned
- "filter": metadata filters for sentiment_label and/or location

Rules:
1. If user doesn't specify vehicle, default to "safari"
2. If user mentions specific competitor, only include that one
3. For location, format as "City, India"
4. Only include filters if explicitly mentioned

Return ONLY valid JSON.

Example: {{"tata_vehicle": "safari", "competitors": ["Mahindra XUV700", "Hyundai Alcazar", "MG Hector Plus"], "embedding_query": "safari vehicle feedback", "filter": {{}}}}
"""
    
    output_text = call_gemini(prompt, max_tokens=200, temperature=0.3)
    
    if not output_text:
        return {
            "tata_vehicle": "safari",
            "competitors": COMPETITOR_MAPPING["safari"],
            "embedding_query": user_query,
            "filter": {}
        }
    
    try:
        cleaned_text = clean_json_response(output_text)
        result = json.loads(cleaned_text)
        
        vehicle = result.get("tata_vehicle", "safari").lower()
        if vehicle not in ["safari", "harrier"]:
            vehicle = "safari"
        
        if not result.get("competitors"):
            result["competitors"] = COMPETITOR_MAPPING[vehicle]
        
        result["tata_vehicle"] = vehicle
        logger.info(f"Identified: {vehicle}, Competitors: {result['competitors']}")
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        return {
            "tata_vehicle": "safari",
            "competitors": COMPETITOR_MAPPING["safari"],
            "embedding_query": user_query,
            "filter": {}
        }

def query_index(index, query_text: str, filters: Dict, top_k: int = 10, 
                brand_filter: Optional[str] = None) -> List[Dict]:
    """Query Pinecone index with embeddings and filters"""
    try:
        if 'location' in filters and filters['location']:
            if ", India" not in filters['location']:
                city_name = filters['location'].title()
                filters['location'] = f"{city_name}, India"
        
        if brand_filter:
            filters['brand'] = brand_filter
        
        query_embedding = embedding_model.encode(query_text).tolist()
        
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filters if filters else None
        )
        
        matches = results.get("matches", [])
        
        if len(matches) == 0 and filters:
            logger.info("No results with filters, trying without")
            results = index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )
            matches = results.get("matches", [])
        
        return matches
        
    except Exception as e:
        logger.error(f"Index query error: {e}")
        return []

def calculate_sentiment_stats(matches: List[Dict]) -> SentimentStats:
    """Calculate sentiment distribution"""
    stats = {"positive": 0, "negative": 0, "neutral": 0, "total": len(matches)}
    
    for match in matches:
        sentiment = match.get("metadata", {}).get("sentiment_label", "neutral").lower()
        if sentiment in ["positive", "negative", "neutral"]:
            stats[sentiment] += 1
    
    # Calculate percentages
    if stats["total"] > 0:
        stats["positive_pct"] = round((stats["positive"] / stats["total"]) * 100, 1)
        stats["negative_pct"] = round((stats["negative"] / stats["total"]) * 100, 1)
        stats["neutral_pct"] = round((stats["neutral"] / stats["total"]) * 100, 1)
    else:
        stats["positive_pct"] = stats["negative_pct"] = stats["neutral_pct"] = 0.0
    
    return SentimentStats(**stats)

def extract_feedback_items(matches: List[Dict], brand: str = None) -> List[FeedbackItem]:
    """Extract feedback items from matches"""
    feedback_list = []
    
    for match in matches:
        metadata = match.get("metadata", {})
        feedback_list.append(FeedbackItem(
            content=metadata.get("content", ""),
            location=metadata.get("location", "Unknown"),
            sentiment=metadata.get("sentiment_label", "neutral"),
            score=round(match.get("score", 0), 4),
            brand=brand or metadata.get("brand", "Unknown")
        ))
    
    return feedback_list

def generate_comparative_analysis(user_query: str, tata_vehicle: str, 
                                  tata_matches: List[Dict], 
                                  competitor_data: Dict) -> str:
    """Generate comprehensive analysis using Gemini"""
    
    tata_posts = [m["metadata"].get("content", "") for m in tata_matches[:5]]
    tata_stats = calculate_sentiment_stats(tata_matches)
    
    competitor_context = []
    for comp_name, comp_matches in competitor_data.items():
        comp_posts = [m["metadata"].get("content", "") for m in comp_matches[:3]]
        comp_stats = calculate_sentiment_stats(comp_matches)
        
        competitor_context.append(f"""
{comp_name}:
- Sentiment: {comp_stats.positive_pct}% positive, {comp_stats.negative_pct}% negative
- Sample feedback: {', '.join(comp_posts[:2])}
""")
    
    tata_feedback_text = "\n".join([f"- {post}" for post in tata_posts])
    competitor_text = "\n".join(competitor_context)
    
    analysis_prompt = f"""
You are a senior automotive market analyst for Tata Motors. Your role is to provide actionable competitive insights.

IMPORTANT CONTEXT:
- You are ONLY analyzing Tata {tata_vehicle.upper()} and its direct competitors
- Do NOT discuss any other Tata vehicles
- Focus on competitive positioning and sales growth strategies

User Query: "{user_query}"

TATA {tata_vehicle.upper()} DATA:
Sentiment Distribution: {tata_stats.positive_pct}% positive, {tata_stats.negative_pct}% negative, {tata_stats.neutral_pct}% neutral
Total Feedback Analyzed: {tata_stats.total}

Customer Feedback:
{tata_feedback_text}

COMPETITOR DATA:
{competitor_text}

ANALYSIS REQUIREMENTS:
Provide a comprehensive analysis with these sections:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Direct answer to the user's question
   - Key takeaway about Tata {tata_vehicle}'s market position

2. SENTIMENT COMPARISON
   - Compare Tata {tata_vehicle}'s sentiment with competitors
   - Highlight where Tata leads or lags

3. KEY STRENGTHS (3-4 points)
   - What customers love about Tata {tata_vehicle}
   - Competitive advantages to emphasize in marketing

4. AREAS FOR IMPROVEMENT (3-4 points)
   - Where competitors are outperforming
   - Customer pain points to address

5. ACTIONABLE RECOMMENDATIONS (3-5 specific actions)
   - Sales & marketing strategies
   - Product improvements
   - Customer experience enhancements
   - Pricing/positioning adjustments

Keep the tone professional, data-driven, and focused on driving sales growth. Use bullet points for clarity.
Total length: 300-400 words.
"""
    
    output = call_gemini(analysis_prompt, max_tokens=800, temperature=0.7)
    return output if output else "Failed to generate analysis. Please try again."

# ========== API Endpoints ==========

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Tata Motors Competitive Intelligence API",
        "version": "2.0.0",
        "description": "AI-powered competitive analysis for Tata Harrier & Safari",
        "documentation": "/docs",
        "endpoints": {
            "health": "GET /health",
            "analyze": "POST /api/analyze"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns status of both indexes and available vehicles
    """
    try:
        tata_stats = tata_index.describe_index_stats()
        competitor_stats = competitor_index.describe_index_stats()
        
        return HealthResponse(
            status="healthy",
            tata_index={
                "name": TATA_INDEX_NAME,
                "vectors": tata_stats.get('total_vector_count', 0)
            },
            competitor_index={
                "name": COMPETITOR_INDEX_NAME,
                "vectors": competitor_stats.get('total_vector_count', 0)
            },
            available_vehicles=["safari", "harrier"],
            competitor_mapping=COMPETITOR_MAPPING
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_query(request: QueryRequest):
    """
    Comprehensive competitive analysis endpoint
    
    Request Body:
        - query: Natural language question about Tata vehicles (required)
        - top_k: Number of results per brand (optional, default: 10)
    
    Example Requests:
    
    1. General analysis:
    {
        "query": "How is Safari performing compared to competitors?",
        "top_k": 10
    }
    
    2. Specific competitor:
    {
        "query": "Compare Harrier with Jeep Compass"
    }
    
    3. Location-specific:
    {
        "query": "What do customers in Mumbai think about Safari?"
    }
    
    4. Sentiment-specific:
    {
        "query": "Show me negative feedback about Harrier"
    }
    
    Response includes:
        - Tata vehicle feedback and sentiment analysis
        - Competitor feedback and sentiment analysis
        - Comprehensive AI-generated comparative analysis
        - Sample feedback from both Tata and competitors
        - Actionable recommendations for sales growth
    """
    try:
        user_query = request.query.strip()
        
        if not user_query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        logger.info(f"Processing query: {user_query}")
        
        # Step 1: Identify vehicle and competitors
        query_info = identify_vehicle_and_competitors(user_query)
        tata_vehicle = query_info["tata_vehicle"]
        competitors = query_info["competitors"]
        embedding_query = query_info["embedding_query"]
        filters = query_info.get("filter", {})
        
        # Step 2: Query Tata data
        logger.info(f"Querying Tata {tata_vehicle} data...")
        tata_matches = query_index(tata_index, embedding_query, filters.copy(), 
                                   top_k=request.top_k)
        
        if not tata_matches:
            return AnalysisResponse(
                success=False,
                query=user_query,
                tata_vehicle=tata_vehicle,
                competitors_analyzed=[],
                tata_feedback_count=0,
                tata_sentiment_stats=SentimentStats(
                    positive=0, negative=0, neutral=0, total=0,
                    positive_pct=0.0, negative_pct=0.0, neutral_pct=0.0
                ),
                tata_sample_feedback=[],
                competitor_analysis=[],
                comprehensive_analysis="No relevant feedback found for Tata vehicles. Please try rephrasing your query.",
                filters_applied=filters,
                error="No results found"
            )
        
        # Extract Tata data
        tata_sentiment_stats = calculate_sentiment_stats(tata_matches)
        tata_feedback_items = extract_feedback_items(tata_matches[:5], f"Tata {tata_vehicle.title()}")
        
        # Step 3: Query competitor data
        logger.info("Querying competitor data...")
        competitor_data = {}
        competitor_analyses = []
        
        for competitor in competitors:
            comp_matches = query_index(
                competitor_index, 
                embedding_query, 
                filters.copy(), 
                top_k=request.top_k,
                brand_filter=competitor
            )
            
            if comp_matches:
                competitor_data[competitor] = comp_matches
                comp_sentiment_stats = calculate_sentiment_stats(comp_matches)
                comp_feedback_items = extract_feedback_items(comp_matches[:3], competitor)
                
                competitor_analyses.append(CompetitorAnalysis(
                    name=competitor,
                    feedback_count=len(comp_matches),
                    sentiment_stats=comp_sentiment_stats,
                    sample_feedback=comp_feedback_items
                ))
        
        # Step 4: Generate comprehensive analysis
        logger.info("Generating AI analysis...")
        comprehensive_analysis = generate_comparative_analysis(
            user_query, 
            tata_vehicle, 
            tata_matches, 
            competitor_data
        )
        
        return AnalysisResponse(
            success=True,
            query=user_query,
            tata_vehicle=tata_vehicle,
            competitors_analyzed=list(competitor_data.keys()),
            tata_feedback_count=len(tata_matches),
            tata_sentiment_stats=tata_sentiment_stats,
            tata_sample_feedback=tata_feedback_items,
            competitor_analysis=competitor_analyses,
            comprehensive_analysis=comprehensive_analysis,
            filters_applied=filters
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)