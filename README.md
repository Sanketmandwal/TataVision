#Tata Motors Competitive Intelligence Platform

##Overview

This project is an *AI-powered competitive intelligence platform* for Tata Motors, focusing on the Harrier and Safari models. It uses a *Retrieval-Augmented Generation (RAG)* approach to collect, process, and analyze social media feedback for Tata and its competitors. The system combines semantic search (retrieval) with generative AI (Gemini API) to deliver actionable insights and recommendations.

---

##Features

-*Multi-source Data Collection:* Reddit and YouTube posts/comments about Tata vehicles.

-*Automated Sentiment & Aspect Extraction:* Uses VADER and custom logic.

-*Text Cleaning & Normalization:* Prepares data for ML and semantic search.

-*Semantic Embeddings:* Generates vector representations using sentence-transformers.

-*Vector Database Integration:* Stores data in Pinecone for fast similarity search.

-*AI-powered Backend:* Uses Gemini API for comparative analysis and recommendations.

-*REST API:* FastAPI backend for frontend integration.

---

##Project Structure



├── app.py                       # FastAPI backend API

├── web_scrapping.py             # Data collection pipeline (Reddit, YouTube)

├── tata_data_normalization.ipynb        # Tata data cleaning & embedding

├── competitor_dat_normalization.ipynb   # Competitor data cleaning & embedding

├── tata_upload.py               # Upload Tata data to Pinecone

├── competitor_upload.py         # Upload competitor data to Pinecone

├── tata_data.jsonl              # Raw Tata posts (sample)

├── tata_data_embedded.jsonl     # Tata posts with embeddings

├── competitor_raw.json          # Raw competitor posts (sample)

├── competitor_data_embedding.jsonl # Competitor posts with embeddings

├── requirements.txt             # Python dependencies



---

##Setup Instructions

###1. Clone the Repository

###2. Install Dependencies

sh

pipinstall-rrequirements.txt



###3. Configure API Keys

-Set your Pinecone, Gemini, Reddit, and YouTube API keys in environment variables or directly in the config files.

###4. Data Collection

-Run web_scrapping.py  to collect and save raw data.

###5. Data Normalization & Embedding

-Run the Jupyter notebooks:

  -tata_data_normalization.ipynb

  -competitor_dat_normalization.ipynb

-These will clean, normalize, and embed the data.

###6. Upload Data to Pinecone

sh

python tata_upload.py

python competitor_upload.py



###7. Start the Backend API

sh

uvicorn app:app --reload


---

##API Endpoints

-GET /health — Health check

-POST /api/analyze — Submit a query for competitive analysis

---

##Example Usage

1.Collect and preprocess data.

2.Upload to Pinecone.

3.Start the API.

4.Send a query (e.g., "What do people think about Tata Harrier vs Jeep Compass?") to /api/analyze.

5.Receive insights, sentiment stats, and recommendations.

---

##Notes

-*Data files:* Only sample data is included. For full-scale use, collect your own data.

-*API keys:* Do not commit sensitive keys to public repositories.

-*Frontend:* Not included here; integrate with your own dashboard or UI.

---

##Authors

- Sanket Mandwal
- Patel Abdul Rahman Khan
- Abrar Chavhan
- Atharva Kulthe
