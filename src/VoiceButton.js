import React, { useState } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

const VoiceButton = () => {
  const [callStatus, setCallStatus] = useState('idle');
  const [error, setError] = useState(null);
  const webClient = new RetellWebClient();

  const startCall = async () => {
    setCallStatus('starting');
    setError(null);

    try {
      // Call Retell API directly
      const response = await fetch('https://api.retellai.com/v2/create-web-call', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer key_5eab32a028419a1c15aa77ebda6c',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: 'agent_7c8f73704438cadeeb8cdac9f2',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message || response.statusText}`);
      }

      const webCallResponse = await response.json();
      console.log('Web call response:', webCallResponse);

      if (!webCallResponse.access_token) {
        throw new Error('Failed to create web call: No access token received');
      }

      // Start WebRTC call
      await webClient.startCall({
        accessToken: webCallResponse.access_token,
        sampleRate: 24000,
      });

      // Handle WebRTC call events
      webClient.on('call_started', () => {
        setCallStatus('active');
        console.log('Call started');
      });

      webClient.on('call_ended', () => {
        setCallStatus('idle');
        console.log('Call ended');
      });

      webClient.on('error', (err) => {
        setError(`Call error: ${err.message}`);
        setCallStatus('idle');
        console.error('Call error:', err);
      });

      webClient.on('agent_start_talking', () => {
        console.log('Agent started talking');
      });

      webClient.on('agent_stop_talking', () => {
        console.log('Agent stopped talking');
      });

    } catch (err) {
      setError(`Failed to start call: ${err.message}`);
      setCallStatus('idle');
      console.error('Error:', err);
    }
  };

  const stopCall = () => {
    setCallStatus('ending');
    webClient.stopCall();
    setCallStatus('idle');
  };

  return (
    <div className="hospital-appointment-card">
      <div className="card-content">
        <h2 className="appointment-title">Hospital Clinical Appointment</h2>
        <p className="appointment-subtitle">Speak with a virtual assistant to schedule your hospital appointment.</p>
        
        <div className="call-button-container">
          <button
            className={`call-button call-button-${callStatus}`}
            onClick={callStatus === 'active' ? stopCall : startCall}
            disabled={callStatus === 'starting' || callStatus === 'ending'}
          >
            <svg 
              className={`phone-icon ${callStatus === 'active' ? 'phone-icon-active' : callStatus === 'starting' || callStatus === 'ending' ? 'phone-icon-processing' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {callStatus === 'active' ? (
                <path 
                  d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.23-2.66 2.14-.26.3-.66.38-1.01.21-.35-.17-.58-.52-.58-.9V8.86c0-.83.66-1.49 1.49-1.49.28 0 .55.08.78.22.46.28 1.01.42 1.56.42.55 0 1.1-.14 1.56-.42.23-.14.5-.22.78-.22.83 0 1.49.66 1.49 1.49v7.01c0 .38-.23.73-.58.9-.35.17-.75.09-1.01-.21-.79-.91-1.68-1.65-2.66-2.14-.33-.16-.56-.51-.56-.9v-3.1C8.85 9.25 10.4 9 12 9z" 
                  fill="#1a1a1a"
                />
              ) : (
                <path 
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" 
                  fill="#1a1a1a"
                />
              )}
            </svg>
            {(callStatus === 'starting' || callStatus === 'active' || callStatus === 'ending') && (
              <span className={`processing-ring ${callStatus === 'active' ? 'processing-ring-active' : ''}`}></span>
            )}
          </button>
          <p className="click-to-call-text">
            {callStatus === 'starting' ? 'Starting call...' : 
             callStatus === 'active' ? 'Call in progress' : 
             callStatus === 'ending' ? 'Ending call...' : 
             'Click to call'}
          </p>
        </div>
        
        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
};

export default VoiceButton;