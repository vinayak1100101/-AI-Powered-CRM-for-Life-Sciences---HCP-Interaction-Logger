# backend/ai_processor.py

import os
from dotenv import load_dotenv
from typing import Optional, List

# --- Import models from schemas ---
from schemas import ExtractedInteractionInfo, SentimentEnum

# --- Langchain and Groq Setup ---
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.messages import BaseMessage # For type hints
import pathlib
import asyncio # For the test block
import traceback # For potentially more detailed error logging

# --- Load Environment Variables ---
current_dir = pathlib.Path(__file__).parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)
# print(f"Attempting to load .env from: {env_path} (in ai_processor.py)") # Optional debug

# --- Initialize Groq Chat Model ---
MODEL_NAME = "llama3-70b-8192"
groq_chat_model = None
try:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print("Error: GROQ_API_KEY not found in environment variables.")
    else:
        groq_chat_model = ChatGroq(
            groq_api_key=groq_api_key,
            model_name=MODEL_NAME
        )
        print(f"Initialized Groq Chat Model: {MODEL_NAME}")
except Exception as e:
    print(f"Error initializing Groq Chat Model: {e}")

# --- Setup Structured Output Parser ---
parser = PydanticOutputParser(pydantic_object=ExtractedInteractionInfo)

# --- Create Prompt Template ---
prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are an expert assistant analyzing notes about interactions with Healthcare Professionals (HCPs) in the life sciences field. Extract key information from the provided text, including HCP name, interaction type, a concise summary, and HCP sentiment (Valid sentiments: Positive, Neutral, Negative, Unknown). Respond ONLY with the structured JSON format requested."),
    ("human", "Please extract the relevant details from the following interaction notes:\n\n---\n{interaction_text}\n---\n\n{format_instructions}")
])

# --- Combine into Langchain Runnable Chain ---
structured_llm_chain = None
if groq_chat_model:
    try:
        structured_llm_chain = prompt_template | groq_chat_model | parser
    except Exception as chain_error:
         print(f"Error creating LLM chain: {chain_error}")
else:
    print("LLM Chain cannot be created because the Groq chat model failed to initialize.")

# --- Main Processing Function ---
async def process_interaction_text(text: str) -> Optional[ExtractedInteractionInfo]:
    """
    Processes raw interaction text using an LLM to extract structured info.
    """
    if not structured_llm_chain:
        print("Error: LLM processing chain is not available.")
        return None

    if not text or not text.strip():
        print("Error: Input text is empty.")
        return None

    try:
        print(f"\n--- Processing Text with {MODEL_NAME} ---")

        # Invoke the standard chain asynchronously
        result: ExtractedInteractionInfo = await structured_llm_chain.ainvoke({
            "interaction_text": text,
            "format_instructions": parser.get_format_instructions(),
        })

        print(f"AI Extraction Result: {result}")
        print("--- Finished Processing Text ---")
        return result

    except Exception as e:
        print(f"Error during AI processing: {e}")
        # print(traceback.format_exc()) # Uncomment for detailed traceback
        return None


# --- Example Usage (for testing this file directly) ---
async def main_test():
    test_notes_list = [
        # ... (add test cases here as needed) ...
        """Met Dr. Smith today. Positive sentiment regarding Drug X results."""
    ]
    for i, test_notes in enumerate(test_notes_list):
        print(f"\n===== Running Test Case {i+1} =====")
        extracted_info = await process_interaction_text(test_notes)
        if extracted_info:
            print("\n--- Direct Test Result ---")
            print(extracted_info.model_dump_json(indent=2)) # Print as formatted JSON
            print("------------------------")
        else:
            print("\n--- Direct Test Failed ---")
        print("============================")

if __name__ == "__main__":
    print("Running ai_processor.py directly for testing...")
    if not os.getenv("GROQ_API_KEY"):
         print("Skipping direct test: GROQ_API_KEY not found.")
    elif not groq_chat_model:
         print("Skipping direct test: Groq chat model not initialized.")
    else:
         asyncio.run(main_test())
         