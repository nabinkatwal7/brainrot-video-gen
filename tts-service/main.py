"""Local voice-cloning TTS sidecar for Brainify.

Wraps Coqui XTTS v2 (https://huggingface.co/coqui/XTTS-v2) behind a small HTTP API so the
Node/TypeScript app can call it without needing a Python runtime of its own.

XTTS v2 is distributed under the Coqui Public Model License (CPML) -- non-commercial use,
see https://coqui.ai/cpml. COQUI_TOS_AGREED=1 below accepts that license non-interactively
so the model can download on first run without a blocking terminal prompt; if you plan to
use this for anything beyond local testing, read the license first.

This process only clones whatever reference voice sample you point it at -- it has no
knowledge of "Peter" or "Stewie". Sourcing a reference clip for a specific copyrighted
character/voice is your call and your responsibility.
"""

import os

os.environ.setdefault("COQUI_TOS_AGREED", "1")

import subprocess
from contextlib import asynccontextmanager
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

MODEL_NAME = "tts_models/multilingual/multi-dataset/xtts_v2"
LANGUAGE = "en"

model_state: dict = {"tts": None, "error": None}


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        import torch
        from TTS.api import TTS

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model_state["tts"] = TTS(MODEL_NAME, progress_bar=False).to(device)
    except Exception as exc:  # first-run model download / load failure
        model_state["error"] = str(exc)
    yield


app = FastAPI(title="brainify-tts-sidecar", lifespan=lifespan)


class SynthesizeRequest(BaseModel):
    text: str
    speaker_wav: str
    language: str = LANGUAGE
    speed: float = 1.0


@app.get("/health")
def health():
    if model_state["error"]:
        raise HTTPException(status_code=503, detail=model_state["error"])
    if model_state["tts"] is None:
        raise HTTPException(status_code=503, detail="model still loading")
    return {"status": "ready"}


@app.post("/synthesize")
def synthesize(req: SynthesizeRequest):
    if model_state["tts"] is None:
        raise HTTPException(status_code=503, detail=model_state["error"] or "model still loading")

    speaker_path = Path(req.speaker_wav)
    if not speaker_path.is_file():
        raise HTTPException(status_code=400, detail=f"speaker_wav not found: {speaker_path}")

    out = NamedTemporaryFile(suffix=".wav", delete=False)
    out.close()
    try:
        model_state["tts"].tts_to_file(
            text=req.text,
            speaker_wav=str(speaker_path),
            language=req.language,
            file_path=out.name,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"synthesis failed: {exc}") from exc

    # Apply speed adjustment if needed
    if abs(req.speed - 1.0) > 0.01:
        import subprocess
        sped = NamedTemporaryFile(suffix=".wav", delete=False)
        sped.close()
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-i", out.name,
                 "-filter:a", f"atempo={req.speed}",
                 "-vn", sped.name],
                capture_output=True, check=True, timeout=30,
            )
            os.unlink(out.name)
            return FileResponse(sped.name, media_type="audio/wav", filename="line.wav")
        except Exception:
            # fallback: return original if speed change fails
            os.unlink(sped.name)

    return FileResponse(out.name, media_type="audio/wav", filename="line.wav")
