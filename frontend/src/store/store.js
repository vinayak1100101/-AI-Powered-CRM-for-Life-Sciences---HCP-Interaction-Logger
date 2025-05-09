// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import interactionsReducer from './interactionsSlice';

export const store = configureStore({
    reducer: {
        // The key 'interactions' determines state slice name (state.interactions)
        interactions: interactionsReducer,
        // Add other reducers here: e.g., auth: authReducer,
    },
    // Optional: Add middleware or enhancers if needed
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});