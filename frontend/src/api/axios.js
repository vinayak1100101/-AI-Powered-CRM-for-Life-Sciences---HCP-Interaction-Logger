// frontend/src/api/axios.js
import axios from 'axios';

const instance = axios.create({
    // Use the address where your FastAPI backend is running
    baseURL: 'http://127.0.0.1:8000',
    timeout: 10000, // Increased timeout slightly for AI calls
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export default instance;