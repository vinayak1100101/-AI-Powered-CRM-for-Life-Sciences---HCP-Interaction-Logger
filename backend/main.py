# backend/main.py

from fastapi import FastAPI, HTTPException, Depends
from typing import List
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware

# Import Pydantic models and database functions
from schemas import (
    InteractionBase,
    InteractionDisplay,
    InteractionCreateResponse,
    InteractionTextInput,
    ExtractedInteractionInfo
)
# --- CORRECTED IMPORT FROM DATABASE ---
from database import get_db_connection, connection_pool
# --- Import AI processing function ---
from ai_processor import process_interaction_text

# Create FastAPI app instance
app = FastAPI(
    title="AI-Powered CRM API",
    description="API for logging and managing HCP interactions.",
    version="0.1.0",
)

# CORS Middleware Setup
origins = [
    "http://localhost:5173", # Default Vite port
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency for database connection ---
def get_db():
    # This function provides a managed DB connection to endpoints using Depends(get_db)
    connection = get_db_connection()
    if not connection:
        # Pool might not be available or failed to get connection
        raise HTTPException(status_code=503, detail="Database connection pool is not available.")
    try:
        yield connection # Provide connection to the endpoint function
    finally:
        # This block executes after the endpoint function finishes
        if connection:
            connection.close() # Return the connection to the pool

# --- API Endpoints ---

# --- Interaction CRUD Endpoints ---

@app.post("/interactions/",
          response_model=InteractionCreateResponse,
          summary="Log a new HCP Interaction",
          tags=["Interactions"])
async def create_interaction(interaction: InteractionBase, db: mysql.connector.MySQLConnection = Depends(get_db)):
    """
    Logs a new interaction with a Healthcare Professional (HCP).
    Receives interaction details in the request body and saves them to the database.
    """
    cursor = None
    try:
        cursor = db.cursor()
        query = """
        INSERT INTO hcp_interactions (
            hcp_name, interaction_type, interaction_datetime, attendees,
            topics_discussed, summary, materials_shared, hcp_sentiment,
            outcomes, follow_up_actions, ai_suggested_follow_ups
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        # Ensure data tuple matches the order and types required by the query
        data = (
            interaction.hcp_name, interaction.interaction_type, interaction.interaction_datetime,
            interaction.attendees, interaction.topics_discussed, interaction.summary,
            interaction.materials_shared, interaction.hcp_sentiment.value, # Get enum value
            interaction.outcomes, interaction.follow_up_actions, interaction.ai_suggested_follow_ups
        )
        cursor.execute(query, data)
        db.commit()
        new_interaction_id = cursor.lastrowid
        # Return success response including the ID and submitted data
        return InteractionCreateResponse(interaction_id=new_interaction_id, data=interaction)

    except mysql.connector.Error as err:
        # Log specific database errors
        print(f"Database Error in create_interaction: {err}")
        if db and db.is_connected(): db.rollback() # Rollback transaction on error
        raise HTTPException(status_code=500, detail=f"Database error occurred: {err}")
    except Exception as e:
        # Log other unexpected errors
        print(f"Unexpected error in create_interaction: {e}")
        if db and db.is_connected(): db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected server error occurred.")
    finally:
        # Ensure cursor is always closed
        if cursor: cursor.close()


@app.get("/interactions/",
         response_model=List[InteractionDisplay],
         summary="Retrieve all HCP Interactions",
         tags=["Interactions"])
async def get_all_interactions(skip: int = 0, limit: int = 100, db: mysql.connector.MySQLConnection = Depends(get_db)):
    """
    Retrieves a list of all logged HCP interactions, ordered by most recent first.
    Supports pagination using `skip` and `limit` query parameters.
    """
    cursor = None
    try:
        cursor = db.cursor(dictionary=True) # Use dictionary cursor for easy Pydantic mapping
        query = "SELECT * FROM hcp_interactions ORDER BY interaction_datetime DESC LIMIT %s OFFSET %s"
        cursor.execute(query, (limit, skip))
        interactions = cursor.fetchall()
        # FastAPI automatically validates the list of dicts against List[InteractionDisplay]
        return interactions
    except mysql.connector.Error as err:
        print(f"Database Error in get_all_interactions: {err}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {err}")
    except Exception as e:
        print(f"Unexpected error in get_all_interactions: {e}")
        raise HTTPException(status_code=500, detail="An unexpected server error occurred.")
    finally:
        if cursor: cursor.close()


@app.get("/interactions/{interaction_id}",
         response_model=InteractionDisplay,
         summary="Retrieve a specific HCP Interaction by ID",
         tags=["Interactions"])
async def get_interaction_by_id(interaction_id: int, db: mysql.connector.MySQLConnection = Depends(get_db)):
    """
    Retrieves the details of a specific HCP interaction using its unique ID.
    """
    cursor = None
    try:
        cursor = db.cursor(dictionary=True)
        query = "SELECT * FROM hcp_interactions WHERE id = %s"
        cursor.execute(query, (interaction_id,)) # Note the trailing comma for single-item tuple
        interaction = cursor.fetchone()
        if interaction is None:
            raise HTTPException(status_code=404, detail=f"Interaction with ID {interaction_id} not found")
        # FastAPI automatically validates the dict against InteractionDisplay
        return interaction
    except mysql.connector.Error as err:
        print(f"Database Error in get_interaction_by_id: {err}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {err}")
    except Exception as e:
        print(f"Unexpected error in get_interaction_by_id: {e}")
        raise HTTPException(status_code=500, detail="An unexpected server error occurred.")
    finally:
        if cursor: cursor.close()

# --- AI Processing Endpoint ---
@app.post("/interactions/process-text/",
          response_model=ExtractedInteractionInfo,
          summary="Process Raw Text to Extract Interaction Details",
          tags=["AI Processing"])
async def process_text_endpoint(input_data: InteractionTextInput):
    """
    Receives raw text about an interaction and uses AI to extract structured details.
    """
    if not input_data.text or not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    try:
        extracted_data = await process_interaction_text(input_data.text)
        if extracted_data is None:
            # AI processing failed (logged within process_interaction_text)
            raise HTTPException(status_code=500, detail="AI processing failed to extract information.")
        # Return the Pydantic object directly, FastAPI handles serialization
        return extracted_data

    except HTTPException as http_exc:
         # Re-raise HTTPExceptions directly
         raise http_exc
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Error in /process-text/ endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred processing text.")


# --- Simple Root Endpoint ---
@app.get("/", tags=["General"], summary="API Root/Health Check")
async def read_root():
    return {"message": "Welcome to the AI-Powered CRM API"}


# --- Optional: Cleanup connection pool on shutdown ---
@app.on_event("shutdown")
def shutdown_event():
    # Usually not needed for mysql.connector pool, but place cleanup here if required
    print("Application shutdown.")