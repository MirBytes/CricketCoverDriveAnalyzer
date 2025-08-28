from fastapi import FastAPI, File, UploadFile
import shutil
from fastapi.middleware.cors import CORSMiddleware
from cover_drive_compare import analyze_video

app = FastAPI()

# --- Add this section ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ------------------------

@app.post("/analyze")
async def analyze_videos(video1: UploadFile = File(...), video2: UploadFile = File(...)):
    # Save both videos temporarily
    with open("video1.mp4", "wb") as buffer:
        shutil.copyfileobj(video1.file, buffer)
    with open("video2.mp4", "wb") as buffer:
        shutil.copyfileobj(video2.file, buffer)

    # Analyze scores
    score1 = analyze_video("video1.mp4")
    score2 = analyze_video("video2.mp4")

    # Return results
    return {
        "video1_score": score1,
        "video2_score": score2,
        "winner": "Video 1" if score1 > score2 else "Video 2" if score2 > score1 else "Tie"
    }
