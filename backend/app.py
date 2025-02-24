import base64
import io
import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from groq import Groq

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not GROQ_API_KEY:
    raise ValueError("Missing API Key for Groq.")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

# System prompt for medical responses
SYSTEM_PROMPT = "Act as Doctor and highly knowledgeable medical expert. Your role is to provide accurate and helpful medical-related responses based on the given image and text query. If a query is not related to medical topics, politely refuse to answer."

def process_image(image_data: bytes, query: str):
    try:
        # Verify image format before encoding
        try:
            img = Image.open(io.BytesIO(image_data))
            img.verify()
        except Exception as e:
            logger.error(f"Invalid Image Format: {str(e)}")
            return {"error": f"Invalid Image Format: {str(e)}"}

        # Encode image to base64
        encoded_image = base64.b64encode(image_data).decode("utf-8")

        # Prepare messages for Groq API
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"{SYSTEM_PROMPT} {query}"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}}
                ]
            }
        ]

        # Call Groq API
        completion = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=messages,
            temperature=1,
            max_completion_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )

        response_text = completion.choices[0].message.content
        logger.info(f"Processed response: {response_text}")

        if "I can only answer medical-related questions" in response_text:
            return {"message": "Sorry, I can only provide medical-related information."}
        
        return {"response": response_text}

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"error": f"An unexpected error occurred: {str(e)}"}

@app.post("/image/")
async def process_image_api(file: UploadFile = File(...), query: str = Form(...)):
    """
    FastAPI endpoint to process an image and return responses from Groq API.
    """
    try:
        image_data = await file.read()
        result = process_image(image_data, query)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Failed to process request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
