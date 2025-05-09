# backend/schemas.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enum for Sentiment validation
class SentimentEnum(str, Enum):
    positive = 'Positive'
    neutral = 'Neutral'
    negative = 'Negative'
    unknown = 'Unknown'

# Base model for interaction data received from the client
class InteractionBase(BaseModel):
    hcp_name: str = Field(..., examples=["Dr. Jane Doe"])
    interaction_type: Optional[str] = Field(None, examples=["Meeting"])
    interaction_datetime: datetime = Field(..., examples=["2025-05-03T19:30:00"])
    attendees: Optional[str] = Field(None, examples=["John Smith, Alice Brown"])
    topics_discussed: Optional[str] = Field(None, examples=["Product X efficacy, Follow-up schedule"])
    summary: Optional[str] = Field(None, examples=["Discussed efficacy, agreed on next steps."])
    materials_shared: Optional[str] = Field(None, examples=["Brochure A, Sample Pack 1"])
    hcp_sentiment: SentimentEnum = SentimentEnum.unknown
    outcomes: Optional[str] = Field(None, examples=["Agreed to trial Product X."])
    follow_up_actions: Optional[str] = Field(None, examples=["Send trial results by next week."])
    ai_suggested_follow_ups: Optional[str] = Field(None, examples=["Schedule follow-up meeting in 2 weeks."])

    class Config:
        # Use from_attributes=True for Pydantic V2+ compatibility
        from_attributes = True


# Model for data returned by the API (includes auto-generated fields)
class InteractionDisplay(InteractionBase):
    id: int
    created_at: datetime
    updated_at: datetime

# Model specifically for the response after creating an interaction
class InteractionCreateResponse(BaseModel):
    message: str = "Interaction logged successfully"
    interaction_id: int
    data: InteractionBase # Return the submitted data for confirmation

# Model for AI Text Input
class InteractionTextInput(BaseModel):
    text: str = Field(..., examples=["Met Dr Evans, discussed new drug trial results positive sentiment."])

# Model for Structured AI Output
class ExtractedInteractionInfo(BaseModel):
    """Structured information extracted from interaction notes by AI."""
    hcp_name: Optional[str] = Field(None, description="The primary Healthcare Professional's name mentioned.")
    interaction_type: Optional[str] = Field(None, description="Type of interaction (e.g., Meeting, Call, Email). Infer if not stated.")
    summary: Optional[str] = Field(None, description="A concise summary of the key discussion points and outcomes.")
    hcp_sentiment: Optional[SentimentEnum] = Field(None, description="The inferred sentiment of the HCP (Positive, Neutral, Negative, or Unknown).")
    # Add other fields like suggested_follow_ups later if needed

    class Config:
        from_attributes = True