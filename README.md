# AI-Powered CRM for Life Sciences - HCP Interaction Logger

This project is an AI-enhanced Customer Relationship Management (CRM) system specifically designed for professionals in the life sciences industry to log their interactions with Healthcare Professionals (HCPs) efficiently. The core feature is the "Log Interaction Screen," which leverages AI to minimize manual data entry.

## Features

* **HCP Interaction Logging:** A dedicated form to log details of interactions (meetings, calls, emails) with doctors.
* **AI-Assisted Data Entry:**
    * Users can input raw text notes about an interaction.
    * An AI model (via Groq and Langchain) processes these notes to extract key details like HCP name, interaction type, summary, and sentiment.
    * These extracted details automatically pre-fill the main logging form, saving user time.
* **Interaction List:** Displays previously logged interactions.
* **Mobile-Friendly Design:** The interface is designed to be responsive and usable on mobile devices.
* **Secure API:** Backend API built with FastAPI for handling data and AI requests.
* **Database Storage:** Interactions are stored in a MySQL database.

## Tech Stack

**Frontend:**

* **React (v18+):** JavaScript library for building user interfaces.
* **Vite:** Fast build tool and development server for React.
* **Redux Toolkit:** For state management.
* **Axios:** For making HTTP requests to the backend.
* **CSS:** For styling components.
* **Google Fonts (Inter):** For typography.

**Backend:**

* **Python (3.10+):** Core programming language.
* **FastAPI:** High-performance web framework for building APIs.
* **Uvicorn:** ASGI server for running the FastAPI application.
* **Pydantic:** For data validation and settings management.
* **MySQL:** Relational database for storing interaction data.
    * `mysql-connector-python`: Python driver for MySQL.
* **`python-dotenv`:** For managing environment variables.
* **Langchain & `langchain-groq`:** Framework and integration for working with Large Language Models (LLMs) from Groq.
* **Groq API:** For fast LLM inference (using models like Llama 3).

## Project Structure


ai-crm-hcp/
├── backend/
│   ├── .env.example         # Example environment variables
│   ├── .gitignore           # Python/FastAPI specific ignores
│   ├── ai_processor.py      # AI logic with Langchain/Groq
│   ├── database.py          # Database connection logic
│   ├── main.py              # FastAPI application, API endpoints
│   ├── requirements.txt     # Python dependencies
│   └── schemas.py           # Pydantic models for data validation
│
├── frontend/
│   ├── .gitignore           # Node/React specific ignores
│   ├── index.html           # Main HTML entry point
│   ├── package.json         # Frontend dependencies and scripts
│   ├── vite.config.js       # Vite configuration
│   ├── public/              # Static assets (e.g., vite.svg)
│   └── src/
│       ├── App.css              # Main App component styles
│       ├── App.jsx              # Main React App component
│       ├── index.css            # Global styles
│       ├── main.jsx             # React application entry point
│       ├── api/
│       │   └── axios.js         # Axios client configuration
│       ├── components/
│       │   ├── InteractionList.css
│       │   ├── InteractionList.jsx
│       │   ├── LogInteractionScreen.css
│       │   └── LogInteractionScreen.jsx
│       └── store/
│           ├── interactionsSlice.js # Redux slice for interactions
│           └── store.js             # Redux store configuration
│
└── README.md                # This file


## Setup and Installation

**Prerequisites:**

* Node.js (v18 or later recommended) and npm (or yarn)
* Python (v3.10 or later recommended) and pip
* MySQL Server installed and running
* A Groq API Key (from [https://console.groq.com/](https://console.groq.com/))

**1. Clone the Repository (Example):**

```bash
git clone <your-repository-url>
cd ai-crm-hcp

2. Backend Setup:

Navigate to the backend directory:

cd backend

Create and activate a Python virtual environment:

python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

Install Python dependencies:

pip install -r requirements.txt

Set up the database:

Ensure your MySQL server is running.

Connect to MySQL and create the database: CREATE DATABASE ai_crm_db;

Use the database: USE ai_crm_db;

Create the hcp_interactions table using the schema below (or from a provided .sql file):

CREATE TABLE hcp_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hcp_name VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(50),
    interaction_datetime DATETIME NOT NULL,
    attendees TEXT,
    topics_discussed TEXT,
    summary TEXT,
    materials_shared TEXT,
    hcp_sentiment ENUM('Positive', 'Neutral', 'Negative', 'Unknown') DEFAULT 'Unknown',
    outcomes TEXT,
    follow_up_actions TEXT,
    ai_suggested_follow_ups TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

Create a .env file in the backend directory by copying .env.example and filling in your actual credentials:

cp .env.example .env
# Now edit .env with your details

Your backend/.env should look like:

DB_HOST=127.0.0.1
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=ai_crm_db
DB_PORT=3306
GROQ_API_KEY=gsk_your_actual_groq_api_key

3. Frontend Setup:

Navigate to the frontend directory:

cd ../frontend

Install Node.js dependencies:

npm install

Running the Application
1. Start the Backend Server:

Ensure your backend virtual environment is activated.

Navigate to the backend directory.

Run Uvicorn:

python -m uvicorn main:app --reload

The backend API should be running on http://127.0.0.1:8000. You can access the API docs at http://127.0.0.1:8000/docs.

2. Start the Frontend Development Server:

Navigate to the frontend directory.

Run the Vite development server:

npm run dev

The frontend application should be accessible at http://localhost:5173 (or another port if 5173 is busy).

How to Use
Open the frontend application in your browser.

AI Assistance (Optional):

On the "Log HCP Interaction" screen, find the "AI Assistant" section (on the right).

Enter or paste your raw notes about an interaction into the text area.

Click "Process Notes with AI".

The main form fields (HCP Name, Type, Summary, Sentiment) on the left should be pre-filled with information extracted by the AI.

Manual Logging:

Review and edit any AI-populated fields.

Fill in the remaining required fields (Date, Time) and any other relevant details.

Select the HCP sentiment using the styled radio buttons.

Save Interaction:

Click the "Log Interaction" button.

A success message should appear, and the form will clear.

View Logged Interactions: The list of previously logged interactions will appear below the form, updating automatically.

Further Development / To-Do
Implement "AI Suggested Follow-ups" display based on the mock-up.

Add editing and deleting capabilities for logged interactions.

Enhance search and filtering for the interaction list.

Implement user authentication and authorization.

More robust error handling and user feedback, especially for AI processing.

Expand AI capabilities (e.g., voice note summarization, more detailed entity extraction, using LangGraph for complex agentic workflows).

Comprehensive unit and integration testing
