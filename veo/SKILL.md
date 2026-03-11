---
name: veo
description: Generate videos with Google Veo 3.1 API. Use when the user asks to create, generate, or produce a video, commercial, ad, reel, or story using AI. Supports text-to-video and image-to-video with portrait/landscape output.
---

# Google Veo 3.1 Video Generation

## Setup

No installation required — use `uv run` with dependencies.

**API Key:** Stored in vault as `GOOGLE_AI_API_KEY`. If missing, user creates one at https://aistudio.google.com/apikey

## Generate Video (Complete Working Example)

### Text-to-video

```sh
# uv run --with "google-genai" --with "httpx" python3 -c "..."
```

```py
import os, time, httpx
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ['GOOGLE_AI_API_KEY'])

operation = client.models.generate_videos(
    model='veo-3.1-generate-preview',  # or "veo-3.1-fast-generate-preview" for speed
    prompt='Your detailed prompt here',
    config=types.GenerateVideosConfig(
        aspect_ratio='9:16',  # "9:16" portrait | "16:9" landscape
        number_of_videos=1,
        duration_seconds=8,
        person_generation='allow_adult',  # may not be supported on all API keys
    ),
)

while not operation.done:
    time.sleep(20)
    operation = client.operations.get(operation)

video = operation.result.generated_videos[0].video
url = f"{video.uri}&key={os.environ['GOOGLE_AI_API_KEY']}"
r = httpx.get(url, follow_redirects=True, timeout=60)
with open('output.mp4', 'wb') as f:
    f.write(r.content)
```

### Image-to-video

```sh
# uv run --with "google-genai" --with "httpx" python3 -c "..."
```

```py
import os, time, httpx
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ['GOOGLE_AI_API_KEY'])

image = types.Image(image_bytes=open('input.jpg', 'rb').read(), mime_type='image/jpeg')

operation = client.models.generate_videos(
    model='veo-3.1-generate-preview',  # or "veo-3.1-fast-generate-preview" for speed
    prompt='Your detailed prompt here',
    image=image,  # omit for text-to-video
    config=types.GenerateVideosConfig(
        aspect_ratio='9:16',  # "9:16" portrait | "16:9" landscape
        number_of_videos=1,
        duration_seconds=8,
        person_generation='allow_adult',  # may not be supported on all API keys
    ),
)

while not operation.done:
    time.sleep(20)
    operation = client.operations.get(operation)

video = operation.result.generated_videos[0].video
url = f"{video.uri}&key={os.environ['GOOGLE_AI_API_KEY']}"
r = httpx.get(url, follow_redirects=True, timeout=60)
with open('output.mp4', 'wb') as f:
    f.write(r.content)
```

## Download Gotchas

These do NOT work — don't waste time trying them:

| ❌ Method                                              | Why it fails                                   |
| ------------------------------------------------------ | ---------------------------------------------- |
| `video.save("out.mp4")`                                | Raises "Saving remote videos is not supported" |
| `video.video_bytes`                                    | Always `None` for generated videos             |
| `httpx.get(video.uri)` without API key                 | Returns 302 error JSON (95 bytes)              |
| `client.files.download(file=video, download_path=...)` | `download_path` param doesn't exist            |

✅ **Only working method:** `httpx.get(f"{video.uri}&key={API_KEY}", follow_redirects=True)`

## Quick Reference

| Param           | Values                                                      |
| --------------- | ----------------------------------------------------------- |
| Models          | `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview` |
| Aspect ratios   | `9:16` (portrait/stories), `16:9` (landscape)               |
| Duration        | 8 seconds (fixed)                                           |
| Max prompt      | 1024 tokens                                                 |
| Generation time | ~60 seconds                                                 |
| Output          | MP4 video, ~1.5 MB                                          |
