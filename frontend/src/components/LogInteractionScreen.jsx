// frontend/src/components/LogInteractionScreen.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addInteraction, resetAddStatus } from '../store/interactionsSlice'; // Assuming path is correct
import apiClient from '../api/axios';
import './LogInteractionScreen.css';

const LogInteractionScreen = () => {
    const dispatch = useDispatch();
    const { addStatus, addError } = useSelector((state) => state.interactions);

    // Form state
    const [hcpName, setHcpName] = useState('');
    const [interactionType, setInteractionType] = useState('Meeting');
    const [interactionDate, setInteractionDate] = useState('');
    const [interactionTime, setInteractionTime] = useState('');
    const [attendees, setAttendees] = useState('');
    const [topicsDiscussed, setTopicsDiscussed] = useState('');
    const [summary, setSummary] = useState('');
    const [materialsShared, setMaterialsShared] = useState('');
    const [hcpSentiment, setHcpSentiment] = useState('Unknown');
    const [outcomes, setOutcomes] = useState('');
    const [followUpActions, setFollowUpActions] = useState('');

    // State for AI processing
    const [rawNotes, setRawNotes] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [aiError, setAiError] = useState(null);

    // Function to clear form fields
    const clearForm = () => {
        setHcpName('');
        setInteractionType('Meeting');
        setInteractionDate('');
        setInteractionTime('');
        setAttendees('');
        setTopicsDiscussed('');
        setSummary('');
        setMaterialsShared('');
        setHcpSentiment('Unknown');
        setOutcomes('');
        setFollowUpActions('');
        setRawNotes('');
        setAiError(null);
    };

    // useEffect for handling addInteraction status
    useEffect(() => {
        if (addStatus === 'succeeded') {
            clearForm();
            const timer = setTimeout(() => { dispatch(resetAddStatus()); }, 3000);
            return () => clearTimeout(timer);
        } else if (addStatus === 'failed') {
            const timer = setTimeout(() => { dispatch(resetAddStatus()); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [addStatus, dispatch]);

    // Handler for AI Processing
    const handleProcessNotes = async () => {
        if (!rawNotes.trim()) {
            setAiError("Please enter some notes to process.");
            return;
        }
        setIsProcessingAI(true);
        setAiError(null);

        try {
            const response = await apiClient.post('/interactions/process-text/', { text: rawNotes });
            const extractedData = response.data;
            console.log("AI Processed Data:", extractedData);

            if (extractedData.hcp_name) setHcpName(extractedData.hcp_name);
            if (extractedData.interaction_type) setInteractionType(extractedData.interaction_type);
            if (extractedData.summary) setSummary(extractedData.summary);
            if (extractedData.hcp_sentiment) setHcpSentiment(extractedData.hcp_sentiment);

        } catch (error) {
            console.error("AI Processing Error:", error);
            const errorDetail = error.response?.data?.detail || "Failed to process notes with AI.";
            setAiError(errorDetail);
        } finally {
            setIsProcessingAI(false);
        }
    };

    // handleSubmit for logging interaction
    const handleSubmit = (event) => {
        event.preventDefault();
        dispatch(resetAddStatus());

        if (!hcpName ) {
            alert('Please fill in HCP Name, Date, and Time.');
            return;
        }
        const interaction_datetime = interactionDate && interactionTime ? `${interactionDate}T${interactionTime}:00` : null;
        if (!interaction_datetime) {
             alert('Please ensure Date and Time are selected.');
             return;
        }
        const interactionData = {
            hcp_name: hcpName,
            interaction_type: interactionType,
            interaction_datetime: interaction_datetime,
            attendees: attendees || null,
            topics_discussed: topicsDiscussed || null,
            summary: summary || null,
            materials_shared: materialsShared || null,
            hcp_sentiment: hcpSentiment,
            outcomes: outcomes || null,
            follow_up_actions: followUpActions || null,
        };
        dispatch(addInteraction(interactionData));
    };

    return (
        <div className="log-interaction-container">
            <div className="log-screen-layout">

                {/* --- Column 1: Log Interaction Details Form (LEFT) --- */}
                <div className="log-interaction-details column">
                    <h2>Log HCP Interaction Details</h2>
                    <form onSubmit={handleSubmit} className="log-interaction-form">
                         {/* Row 1: HCP Name, Interaction Type */}
                         <div className="form-row">
                            <div className="form-group"> <label htmlFor="hcpName">HCP Name *</label> <input type="text" id="hcpName" value={hcpName} onChange={(e) => setHcpName(e.target.value)} required /> </div>
                            <div className="form-group"> <label htmlFor="interactionType">Interaction Type</label> <input type="text" id="interactionType" value={interactionType} onChange={(e) => setInteractionType(e.target.value)} placeholder="e.g., Meeting, Call" /> </div>
                        </div>
                         {/* Row 2: Date, Time */}
                         <div className="form-row">
                           <div className="form-group"> <label htmlFor="interactionDate">Date *</label> <input type="date" id="interactionDate" value={interactionDate} onChange={(e) => setInteractionDate(e.target.value)} required /> </div>
                           <div className="form-group"> <label htmlFor="interactionTime">Time *</label> <input type="time" id="interactionTime" value={interactionTime} onChange={(e) => setInteractionTime(e.target.value)} required /> </div>
                        </div>
                        {/* Row 3: Attendees */}
                        <div className="form-row"> <div className="form-group full-width"> <label htmlFor="attendees">Attendees</label> <input type="text" id="attendees" value={attendees} placeholder="Enter names or search..." onChange={(e) => setAttendees(e.target.value)} /> </div> </div>
                        {/* Row 4: Topics Discussed */}
                        <div className="form-row"> <div className="form-group full-width"> <label htmlFor="topicsDiscussed">Topics Discussed</label> <textarea id="topicsDiscussed" value={topicsDiscussed} onChange={(e) => setTopicsDiscussed(e.target.value)} rows="3" /> </div> </div>
                         {/* Row 5: AI Summary */}
                         <div className="form-row"> <div className="form-group full-width"> <label htmlFor="summary">AI Summary</label> <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows="3" placeholder="AI will generate a summary here..." /> </div> </div>
                        {/* Row 6: Materials Shared */}
                        <div className="form-row"> <div className="form-group full-width"> <label htmlFor="materialsShared">Materials Shared / Samples Distributed</label> <textarea id="materialsShared" value={materialsShared} onChange={(e) => setMaterialsShared(e.target.value)} rows="2" /> </div> </div>
                        {/* Row 7: HCP Sentiment (Styled Radio Buttons) */}
                         <div className="form-row"> <div className="form-group full-width"> <label>Observed/Inferred HCP Sentiment</label> <div className="sentiment-radio-group"> {['Positive', 'Neutral', 'Negative', 'Unknown'].map(sentimentValue => ( <label key={sentimentValue} className={`sentiment-radio-label sentiment-${sentimentValue.toLowerCase()} ${hcpSentiment === sentimentValue ? 'selected' : ''}`} htmlFor={`sentiment-${sentimentValue.toLowerCase()}`}> <input type="radio" id={`sentiment-${sentimentValue.toLowerCase()}`} name="hcpSentiment" value={sentimentValue} checked={hcpSentiment === sentimentValue} onChange={(e) => setHcpSentiment(e.target.value)} /> {sentimentValue} </label> ))} </div> </div> </div>
                        {/* Row 8: Outcomes */}
                        <div className="form-row"> <div className="form-group full-width"> <label htmlFor="outcomes">Outcomes</label> <textarea id="outcomes" value={outcomes} onChange={(e) => setOutcomes(e.target.value)} placeholder="Key outcomes or agreements..." rows="3"/> </div> </div>
                        {/* Row 9: Follow-up Actions */}
                         <div className="form-row"> <div className="form-group full-width"> <label htmlFor="followUpActions">Follow-up Actions</label> <textarea id="followUpActions" value={followUpActions} onChange={(e) => setFollowUpActions(e.target.value)} placeholder="Enter next steps or tasks..." rows="3"/> </div> </div>
                        {/* Submit Button & Status Message */}
                        <div className="form-actions"> <button type="submit" disabled={addStatus === 'loading'}> {addStatus === 'loading' ? 'Logging...' : 'Log Interaction'} </button> {addStatus === 'succeeded' && <p className="success-message">Interaction logged successfully!</p>} {addStatus === 'failed' && <p className="error-message">Error: {addError || 'Failed to log interaction.'}</p>} </div>
                    </form>
                </div>
                {/* --- End Column 1 --- */}

                 {/* --- Column 2: AI Input Section (RIGHT) --- */}
                <div className="ai-input-section column">
                    <h3>AI Assistant</h3>
                    <p>Enter raw notes below and click "Process" to pre-fill fields on the left.</p>
                    <textarea id="rawNotes" rows="12" placeholder="Paste or type your interaction notes here..." value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} disabled={isProcessingAI} />
                    <div className="ai-actions"> <button type="button" onClick={handleProcessNotes} disabled={isProcessingAI || !rawNotes.trim()} className="ai-button"> {isProcessingAI ? 'Processing...' : 'Process Notes with AI'} </button> {aiError && <p className="error-message ai-error">{aiError}</p>} </div>
                </div>
                {/* --- End Column 2 --- */}

            </div> {/* End log-screen-layout */}
        </div> // End log-interaction-container
    );
};

export default LogInteractionScreen;