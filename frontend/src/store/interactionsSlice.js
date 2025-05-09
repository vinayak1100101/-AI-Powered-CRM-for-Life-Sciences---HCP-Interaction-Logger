// frontend/src/store/interactionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios'; // Import configured Axios instance

// --- Async Thunks ---

// Fetch all interactions
export const fetchInteractions = createAsyncThunk(
    'interactions/fetchInteractions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/interactions/?limit=200'); // Fetch more items
            return response.data; // This will be the array of interactions
        } catch (error) {
            console.error("Fetch Interactions Error:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch interactions');
        }
    }
);

// Add a new interaction
export const addInteraction = createAsyncThunk(
    'interactions/addInteraction',
    async (interactionData, { rejectWithValue }) => {
        try {
            // interactionData should match InteractionBase schema from backend
            const response = await apiClient.post('/interactions/', interactionData);
            // Return the successful response (includes { message, interaction_id, data })
            return response.data;
        } catch (error) {
            console.error("Add Interaction Error:", error.response?.data || error.message);
            // Try to return a specific error message from backend if available
            return rejectWithValue(error.response?.data?.detail || 'Failed to add interaction');
        }
    }
);

// --- Initial State ---
const initialState = {
    items: [],          // Array of interaction objects
    status: 'idle',     // Fetch status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,        // Holds fetch error message
    addStatus: 'idle',  // Add status: 'idle' | 'loading' | 'succeeded' | 'failed'
    addError: null,     // Holds add error message
};

// --- Slice Definition ---
const interactionsSlice = createSlice({
    name: 'interactions',
    initialState,
    // Synchronous reducers
    reducers: {
        resetAddStatus(state) {
            state.addStatus = 'idle';
            state.addError = null;
        },
        // Example: If you wanted to manually add an item without refetching
        // interactionAdded(state, action) {
        //     state.items.unshift(action.payload); // Add to beginning
        // }
    },
    // Handle states for async thunks
    extraReducers: (builder) => {
        builder
            // fetchInteractions states
            .addCase(fetchInteractions.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchInteractions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchInteractions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // addInteraction states
            .addCase(addInteraction.pending, (state) => {
                state.addStatus = 'loading';
                state.addError = null;
            })
            .addCase(addInteraction.fulfilled, (state, action) => {
                state.addStatus = 'succeeded';
                console.log("Interaction added successfully via Redux:", action.payload);
                // Mark fetch status as idle to trigger refetch in InteractionList
                state.status = 'idle';
            })
            .addCase(addInteraction.rejected, (state, action) => {
                state.addStatus = 'failed';
                state.addError = action.payload;
            });
    },
});

// Export actions and reducer
export const { resetAddStatus } = interactionsSlice.actions;
export default interactionsSlice.reducer;