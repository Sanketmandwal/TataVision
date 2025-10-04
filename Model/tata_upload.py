import json
import uuid
from pinecone import Pinecone, ServerlessSpec

# --- 1. CONFIGURE PINECONE ---
PINECONE_API_KEY = "pcsk_5YprLt_4rZejyDU3Sq7CrQ9JcDsmRpVTiXEPFnjoPP1vMHuVkpjDMRVKMeb49WM31ZY8e2"
INDEX_NAME = "tata-motors-sentiment"
REGION = "us-east-1"  # use your Pinecone environment region

# --- 2. INITIALIZE PINECONE CLIENT ---
print("Initializing Pinecone client...")
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)
print("Pinecone initialized.")

# --- 3. LOAD AND PREPARE YOUR DATA ---
print("Loading data from 'sample_posts_enriched.jsonl'...")
with open('tata_data_embedded.jsonl', 'r', encoding='utf-8') as f:
    posts = [json.loads(line) for line in f]
print(f"Loaded {len(posts)} posts.")

# --- 4. UPSERT DATA IN BATCHES ---
batch_size = 100
vectors_to_upsert = []
print("Starting data upload to Pinecone...")

for i, post in enumerate(posts):
    metadata = {
        "content": post.get("clean_content") or post.get("content"),
        "sentiment_label": post.get("sentiment", {}).get("label"),
        "location": post.get("location", {}).get("final_location")
    }
    metadata = {k: v for k, v in metadata.items() if v is not None}
    
    vectors_to_upsert.append((str(uuid.uuid4()), post["embedding"], metadata))
    
    if len(vectors_to_upsert) == batch_size or i == len(posts) - 1:
        print(f"Uploading batch of {len(vectors_to_upsert)} vectors...")
        index.upsert(vectors=vectors_to_upsert)
        vectors_to_upsert = []

print("\n--- Upload Complete! ---")

# --- 5. VERIFY ---
stats = index.describe_index_stats()
print(f"Verification: Vector count in Pinecone is now {stats.get('total_vector_count', 'N/A')}.")
