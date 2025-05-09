// frontend/src/components/InteractionList.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInteractions } from '../store/interactionsSlice';
import './InteractionList.css'; // We'll create this CSS file

// Helper function to format date and time nicely
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleString('en-US', { // Or use your preferred locale
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Invalid Date';
    }
};

const InteractionList = () => {
    const dispatch = useDispatch();
    // Select relevant state from the Redux store
    const {
        items: interactions, // Rename items to interactions for clarity
        status: fetchStatus, // Rename status to fetchStatus
        error: fetchError
    } = useSelector((state) => state.interactions);

    // Fetch interactions when the component mounts
    useEffect(() => {
        // Only fetch if the status is idle (to avoid fetching multiple times unnecessarily)
        if (fetchStatus === 'idle') {
            dispatch(fetchInteractions());
        }
    }, [fetchStatus, dispatch]);

    // Content based on fetch status
    let content;
    if (fetchStatus === 'loading') {
        content = <p>Loading interactions...</p>;
    } else if (fetchStatus === 'succeeded') {
        if (interactions.length === 0) {
            content = <p>No interactions logged yet.</p>;
        } else {
            content = (
                <ul className="interaction-list">
                    {interactions.map((interaction) => (
                        <li key={interaction.id} className="interaction-item">
                            <h3>{interaction.hcp_name || 'N/A'}</h3>
                            <p><strong>Type:</strong> {interaction.interaction_type || 'N/A'}</p>
                            <p><strong>Date & Time:</strong> {formatDateTime(interaction.interaction_datetime)}</p>
                            {interaction.topics_discussed && <p><strong>Topics:</strong> {interaction.topics_discussed}</p>}
                            {interaction.attendees && <p><strong>Attendees:</strong> {interaction.attendees}</p>}
                            {interaction.outcomes && <p><strong>Outcomes:</strong> {interaction.outcomes}</p>}
                            <p><strong>Sentiment:</strong> {interaction.hcp_sentiment || 'N/A'}</p>
                            {/* Add other fields as needed */}
                        </li>
                    ))}
                </ul>
            );
        }
    } else if (fetchStatus === 'failed') {
        content = <p className="error-message">Error fetching interactions: {fetchError || 'Unknown error'}</p>;
    }

    return (
        <div className="interaction-list-container">
            <h2>Logged Interactions</h2>
            {content}
        </div>
    );
};

export default InteractionList;