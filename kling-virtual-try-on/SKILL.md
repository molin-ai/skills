---
name: kling-virtual-try-on
description: Kling AI virtual try-on workflow for generating images of people wearing specific garments. Use when the user wants virtual try-on, AI model product photos, or e-commerce garment imagery.
---

# Kling AI Virtual Try-On Skill

> Generate realistic images of a person wearing specific clothing. Trigger when user wants virtual try-on, AI model product photos, or e-commerce garment imagery.

---

## Setup

1. Get credentials at [Kling AI Developer Console](https://app.klingai.com/global/dev/api-key) — save **Access Key** + **Secret Key** (secret is shown once only). Max 10 keys per account.
2. Buy a **Virtual Try-On resource package** at [klingai.com/global/dev/model/tryon](https://klingai.com/global/dev/model/tryon) (separate from video/image packages).
3. Store in vault:
```bash
n vault set KLING_AI_ACCESS_KEY "<access_key>"
n vault set KLING_AI_SECRET_KEY "<secret_key>"
```

## Handling User-Uploaded Images

When a user uploads images, they arrive in the sandbox filesystem (e.g. `/home/ninja/uploads/person.jpg`). The Kling API cannot reach the sandbox — use **base64 encoding** to send them inline:

```python
import base64
with open("/home/ninja/uploads/person.jpg", "rb") as f:
    human_image_b64 = base64.b64encode(f.read()).decode("utf-8")
# Then pass human_image_b64 as the "human_image" value in the API body
```

This is the default approach. No external hosting or public URLs needed. The API accepts base64 natively for both `human_image` and `cloth_image`.

**Pre-flight checks before sending:**
- Validate dimensions ≤ 4096px per side and ≤ 16M total pixels — resize with PIL if needed
- Confirm format is JPG/PNG
- If the user uploads a product page URL instead of a file, download the image to sandbox first, then base64-encode it

## Authentication

Every request needs a JWT token (HS256, 30 min TTL). **This is Kling-specific — not a standard Bearer API key.**

```python
import time, jwt

def generate_kling_token(access_key, secret_key):
    now = int(time.time())
    return jwt.encode(
        {"iss": access_key, "exp": now + 1800, "nbf": now - 5},
        secret_key, algorithm="HS256",
        headers={"alg": "HS256", "typ": "JWT"}
    )
```

Header: `Authorization: Bearer <token>` (space between Bearer and token).

## API

**Domain:** `https://api-singapore.klingai.com` (for servers outside China)

### Create Task

`POST /v1/images/kolors-virtual-try-on`

```json
{
  "human_image": "<url_or_base64>",
  "cloth_image": "<url_or_base64>",
  "model": "kolors-virtual-try-on-v1-5"
}
```

| Param | Required | Notes |
|---|---|---|
| `human_image` | Yes | URL or base64 of person photo |
| `cloth_image` | Yes | URL or base64 of garment photo |
| `model` | No | `kolors-virtual-try-on` (default) or `kolors-virtual-try-on-v1-5` (better, supports top+bottom combo) |
| `webhook_url` | No | Callback URL for async delivery |

Returns `data.task_id`. Task is async — always.

### Query Task

`GET /v1/images/kolors-virtual-try-on/{task_id}`

Poll every 2–3s. Typical completion: **10–13 seconds**.

| `task_status` | Meaning |
|---|---|
| `submitted` | Queued |
| `processing` | In progress |
| `succeed` | Done — images at `data.task_result.images[].url` |
| `fail` | Failed — reason in `task_status_msg` |

## Model Versions

| Model | Description |
|---|---|
| `kolors-virtual-try-on` | Single garment input only |
| `kolors-virtual-try-on-v1-5` | **Preferred.** Single garment OR stitched top+bottom in one image |

v1.5 combo rules: top+bottom ✅ | top+top ❌ | bottom+bottom ❌ | anything+one-piece ❌

## Image Requirements

**Max:** 16M pixels, 4096px per side. Formats: JPG, PNG.

### Garment Image (cloth_image)

✅ Single item, white/plain background, flat lay, clear details, unobstructed, garment fills frame
❌ Multiple items, complex backgrounds, intricate patterns, watermarks, folded/obscured clothing, bottom-wear only (in v1)

### Model Image (human_image)

✅ Single person, full or half body, standing, simple pose, fitted clothing, unobstructed clothing area
❌ Groups, seated/leaning, complex poses, bulky clothing, hands/hair covering outfit area

## Human Model Image: Selection Flow

The API requires a `human_image`. Follow this decision tree:

### Option A: User uploads their own
Use it directly. Validate against the image requirements above.

### Option B: User picks from the built-in library
A pre-built model library is available via the skill data or `n` CLI. Each model has: **name, gender, skin tone, age range, and a public image URL**.

**Flow:**
1. Load the model list (from skill data or `n kling tryon models` CLI command)
2. Present the models to the user — show each model's name, description, and image (render the URL in chat so they can see it)
3. User picks one → use that model's URL as `human_image`

### Option C: User wants a custom model not in the library
Use **Nano Banana** (Gemini image generation) to create one.

**Prompt template:**
```
Professional full-body fashion photography of a [age] year old [gender] model,
[skin_tone] skin, [body_type] build, standing in a simple natural pose,
wearing plain fitted [simple_clothing] (solid color, no patterns),
clean white studio background, high resolution, fashion e-commerce style,
soft even lighting, sharp focus, camera at eye level
```

**Rules for generated model images** (critical for try-on quality):
- Simple fitted clothing, solid color — no patterns/logos/layers
- Standing pose, not seated/leaning
- White/plain background
- Full-body for dresses/bottoms, half-body for tops
- Unobstructed torso area — no crossed arms, bags, hair covering outfit

**Approval loop (MANDATORY):**
1. Ask user what they want (gender, age, skin tone, body type, etc.)
2. Generate with Nano Banana → save to sandbox
3. Show result to user in browser
4. Ask: "Does this look good? (yes / regenerate / modify)"
5. Only proceed to try-on on explicit "yes"

## Delivering Results to the User

After the Kling API returns the try-on result:

```
1. Download result image from the URL to sandbox (e.g. /home/ninja/tryon/result.png)
2. Open the image in the browser so the user can see it
3. Generate a download link: filesystem download_url → share with user
4. Ask: "Want to try another garment, adjust something, or download?"
```

The download link expires in 60 seconds — regenerate on demand if the user asks again.

## Critical Tips (Non-Obvious)

1. **Tops: use half-body model photo** — better logo/text detail preservation than full-body.
2. **Match sleeve type.** Model wearing short sleeves → try on short sleeves. Don't try a tee on a model in a trench coat.
3. **Match fit.** Fitted tank top on model wearing loose cardigan → bad result. Model's clothing fit must match target garment fit.
4. **Dresses: standing poses only.** Seated/folded poses break long garment rendering.
5. **Bottoms: full-body model, no boots/dresses on model** — these prevent bottoms from being applied.
6. **Fine text/small logos will be imperfect** when the garment occupies a small portion of the image. This is a known limitation.
7. **Face can be obscured** — privacy-friendly, model still works.
8. **Output aspect ratios:** 1:1, 4:3, 3:4, 3:2, 2:3 (via image scaling tool in Kling UI, not API param).
9. **Chain with Kling image-to-video** to create dynamic model showcase videos from try-on results.

## Concurrency

- Account-level, per resource pack type. Each task = 1 slot.
- **No QPS limit** — only concurrent task count matters.
- Over-limit → 429 error. Use exponential backoff.

## Key Error Codes (Kling-Specific)

| Code | Meaning |
|---|---|
| 1001–1004 | JWT issues (empty/invalid/not-yet-valid/expired) — regenerate token |
| 1102 | Resource pack depleted — buy more |
| 1103 | No virtual try-on permission — check account |
| 1301 | Content safety violation — change images |
| 1302/1303 | Rate/concurrency limit — back off |

## Third-Party Proxies

If direct API isn't available, these wrap it (~$0.065–0.07/image):

| Provider | Endpoint | Auth | Notes |
|---|---|---|---|
| PiAPI | `POST api.piapi.ai/api/v1/task` | `x-api-key` | Uses `model_input`, `dress_input`, `upper_input`, `lower_input` |
| useapi.net | `POST api.useapi.net/v1/kling/images/virtual-try-on` | Bearer | Uses `humanImage`, `dressInput`, `upperInput`, `lowerInput` |
| fal.ai | `fal-ai/kling/v1-5/kolors-virtual-try-on` | `FAL_KEY` | Uses `human_image_url`, `garment_image_url` |

## Open Source

Kolors model is open-source: [github.com/Kwai-Kolors/Kolors](https://github.com/Kwai-Kolors/Kolors). Python adapter with auto-polling: [github.com/tryonlabs/opentryon](https://github.com/tryonlabs/opentryon) (`tryon.api.kling_ai`).
