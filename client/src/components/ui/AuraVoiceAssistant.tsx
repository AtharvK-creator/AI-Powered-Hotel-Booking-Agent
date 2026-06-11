import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../api/chat';
import { useAuthStore } from '../../store/authStore';
import './AuraVoiceAssistant.css';

interface SimpleMessage {
  sender: 'user' | 'ai';
  text: string;
}

function cleanTextForSpeech(text: string): string {
  // 1. Detect if it's a hotel search result
  if (text.includes('Search Results') || (text.includes('Found') && text.includes('hotel(s)'))) {
    const hotels: string[] = [];
    const hotelRegex = /🏨\s*\*\*([^*]+)\*\*(?:\s*\(ID:\s*`[^`]+`\))?/g;
    let match;
    while ((match = hotelRegex.exec(text)) !== null) {
      hotels.push(match[1].trim());
    }

    const cityMatch = text.match(/in\s+([A-Za-z\s]+)(?:\):|:)/);
    const city = cityMatch ? cityMatch[1].trim() : 'India';

    if (hotels.length > 0) {
      if (hotels.length === 1) {
        return `I found one hotel in ${city}: ${hotels[0]}. You can review the full details and pricing on your screen.`;
      }
      return `I found ${hotels.length} hotels in ${city}, including ${hotels.slice(0, 3).join(', ')}. The full list with pricing and amenities is displayed on your screen.`;
    }
  }

  // 2. Detect booking history
  if (text.includes('Your Booking History') || text.includes('booking history')) {
    const bookingIds: string[] = [];
    const idRegex = /Booking ID:\*\*?\s*`([^`]+)`/gi;
    let match;
    while ((match = idRegex.exec(text)) !== null) {
      bookingIds.push(match[1].trim());
    }
    if (bookingIds.length > 0) {
      return `I found ${bookingIds.length} reservation${bookingIds.length > 1 ? 's' : ''} in your booking history. You can view the details and dates on the screen.`;
    }
  }

  // 3. Detect booking confirmation
  if (text.includes('Booking Confirmed') || text.includes('Booking successfully confirmed')) {
    const idMatch = text.match(/Booking ID:\*\*?\s*`([^`]+)`/i) || text.match(/ID:\s*([A-Z0-9-]+)/i);
    const id = idMatch ? idMatch[1].trim() : '';
    const roomMatch = text.match(/Room Type:\*\*?\s*([^\n]+)/i);
    const room = roomMatch ? roomMatch[1].replace(/[*_]/g, '').trim() : '';
    
    let speech = "Your booking is confirmed!";
    if (id) speech += ` Your booking ID is ${id.split('').join(' ')}.`;
    if (room) speech += ` I booked the ${room} for you.`;
    speech += " A confirmation email has been sent.";
    return speech;
  }

  // 4. Detect booking modification
  if (text.includes('Booking Modified') || text.includes('updated successfully')) {
    const idMatch = text.match(/booking\s*`([^`]+)`/i) || text.match(/ID:\s*([A-Z0-9-]+)/i);
    const id = idMatch ? idMatch[1].trim() : '';
    return `Your booking ${id ? id.split('').join(' ') : ''} has been modified successfully. The new details are shown on your screen.`;
  }

  // 5. Detect booking cancellation
  if (text.includes('Booking Cancelled') || text.includes('cancelled successfully')) {
    return "Your booking has been cancelled successfully. A confirmation email has been sent.";
  }

  // 6. Generic cleaning
  let clean = text
    .replace(/[*#_`~[\]()]/g, '') // Strip markdown characters
    .replace(/✦/g, '') // Strip stars
    .replace(/🏨/g, '') // Strip emojis
    .replace(/💳/g, '')
    .replace(/📅/g, '')
    .replace(/⭐/g, '')
    .replace(/📍/g, '')
    .replace(/💵/g, '')
    .replace(/✨/g, '')
    .replace(/🛏️/g, '')
    .replace(/❌/g, '')
    .replace(/✏️/g, '')
    .replace(/⚠️/g, 'Warning: ')
    .replace(/BK-\d{8}-[A-Z0-9]+/g, (match) => `booking code ${match.split('').join(' ')}`); // Spell out booking ID

  // Limit long texts by breaking at the last sentence boundary under 350 chars
  if (clean.length > 350) {
    const truncated = clean.slice(0, 350);
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > 150) {
      clean = truncated.slice(0, lastPeriod + 1) + " Please see the screen for full details.";
    } else {
      clean = truncated + "... Please see the screen for details.";
    }
  }

  return clean;
}

export default function AuraVoiceAssistant() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  
  // Status states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for synchronous state tracking (avoids stale closures and state batching lags)
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isWakeWordActiveRef = useRef(true);
  const isOpenRef = useRef(false);
  const isWakeListeningRef = useRef(false);
  const isThinkingRef = useRef(false);

  const recognitionRef = useRef<any>(null);
  const wakeWordRecRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state changes with Refs
  const setIsListeningSync = (val: boolean) => {
    isListeningRef.current = val;
    setIsListening(val);
  };

  const setIsSpeakingSync = (val: boolean) => {
    isSpeakingRef.current = val;
    setIsSpeaking(val);
  };

  const setIsThinkingSync = (val: boolean) => {
    isThinkingRef.current = val;
    setIsThinking(val);
  };

  // Sync wake word toggle with Ref and start/stop listener
  useEffect(() => {
    isWakeWordActiveRef.current = isWakeWordActive;
    if (isWakeWordActive) {
      startWakeWordListener();
    } else {
      stopWakeWordListener();
    }
  }, [isWakeWordActive]);

  // Sync drawer visibility with Ref
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Sync session and history from backend
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      chatApi.getHistory()
        .then((res) => {
          setSessionId(res.data.data.sessionId);
          const history = res.data.data.messages || [];
          if (history.length > 0) {
            const formatted = history.slice(-4).map((m: any) => ({
              sender: m.role === 'user' ? 'user' : 'ai',
              text: m.content
            }));
            setMessages(formatted);
          } else {
            setMessages([{ sender: 'ai', text: 'Welcome. I am Aura, your digital concierge. How may I assist you today?' }]);
          }
        })
        .catch(() => {
          setMessages([{ sender: 'ai', text: 'Hello, I am Aura. How can I help you discover our premium estates?' }]);
        });
    } else if (isOpen) {
      setMessages([{ sender: 'ai', text: 'Hello, I am Aura. Please sign in to experience full concierge services, or feel free to browse our collection.' }]);
    }
  }, [isAuthenticated, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isThinking, isSpeaking]);

  // Disable background wake listener
  const stopWakeWordListener = () => {
    isWakeListeningRef.current = false;
    if (wakeWordRecRef.current) {
      const rec = wakeWordRecRef.current;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.stop(); } catch(e){}
      wakeWordRecRef.current = null;
    }
  };

  // Stop main listener cleanly
  const stopCommandListener = (submit: boolean = false) => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.stop(); } catch(e){}
      recognitionRef.current = null;
    }
    setIsListeningSync(false);
    
    if (submit && inputText.trim()) {
      handleUserMessage(inputText.trim());
    }

    if (isWakeWordActiveRef.current && isOpenRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
      setTimeout(() => startWakeWordListener(), 300);
    }
  };

  // Audio synthesis output
  const speak = (text: string) => {
    if (!synthRef.current || isMuted) {
      // If muted, restart the wake word listener immediately if enabled
      if (isWakeWordActiveRef.current && isOpenRef.current) {
        setTimeout(() => startWakeWordListener(), 100);
      }
      return;
    }

    synthRef.current.cancel(); // Cancel active synthesis audio

    // Stop active mic capturing sessions to prevent hardware conflict and abort errors
    stopCommandListener(false);
    stopWakeWordListener();

    // Convert text output to natural spoken summary
    const cleanText = cleanTextForSpeech(text);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synthRef.current.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.lang.startsWith('en-'));
    if (premiumVoice) utterance.voice = premiumVoice;

    let speakingTimeout: any = null;

    const clearSpeaking = () => {
      if (speakingTimeout) clearTimeout(speakingTimeout);
      setIsSpeakingSync(false);
    };

    utterance.onstart = () => {
      setIsSpeakingSync(true);
      // Safety timeout: auto-clear speaking state after 12 seconds in case browser hangs on onend
      speakingTimeout = setTimeout(() => {
        if (isSpeakingRef.current) {
          console.warn('Speech synthesis safety timeout triggered.');
          clearSpeaking();
          if (isWakeWordActiveRef.current && isOpenRef.current) {
            startWakeWordListener();
          }
        }
      }, 12000);
    };

    utterance.onend = () => {
      clearSpeaking();
      // Wait 300ms after speaking ends to clear the audio channels, then restart wake word
      if (isWakeWordActiveRef.current && isOpenRef.current) {
        setTimeout(() => startWakeWordListener(), 300);
      }
    };

    utterance.onerror = () => {
      clearSpeaking();
      if (isWakeWordActiveRef.current && isOpenRef.current) {
        setTimeout(() => startWakeWordListener(), 300);
      }
    };

    synthRef.current.speak(utterance);
  };

  // Generate web audio beep chime
  const playChime = (high: boolean = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(high ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio Context chime failed', e);
    }
  };

  // Setup main listener for command input
  const startCommandListener = () => {
    if (synthRef.current) synthRef.current.cancel(); // Stop talking
    setIsSpeakingSync(false);
    
    // Stop background wake word listener
    stopWakeWordListener();

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg('Web Speech API is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }

    playChime(true);
    setErrorMsg('');
    setIsListeningSync(true);

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    let silenceTimer: any = null;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText.trim()) {
        setInputText(activeText);
      }

      // Reset the silence timer. Wait 1.8 seconds of silence to ensure user has completed their sentence.
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        recognition.stop();
        const textToSend = finalTranscript.trim() || interimTranscript.trim();
        if (textToSend) {
          handleUserMessage(textToSend);
        }
      }, 1800);
    };

    recognition.onerror = (event: any) => {
      console.error('Command listener speech recognition error:', event.error);
      if (silenceTimer) clearTimeout(silenceTimer);

      // Handle common aborted/no-speech errors silently
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone permission denied.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setErrorMsg(`Speech input error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      setIsListeningSync(false);
      // Restart wake word listener synchronously check on end
      if (isWakeWordActiveRef.current && isOpenRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
        setTimeout(() => startWakeWordListener(), 300);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Setup background wake word listener ("Hey Aura")
  const startWakeWordListener = () => {
    // If speaking, listening, thinking, or already wake-listening, prevent starting
    if (isListeningRef.current || isSpeakingRef.current || isThinkingRef.current) {
      return;
    }
    if (isWakeListeningRef.current) {
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    stopWakeWordListener();

    const wakeRec = new SpeechRec();
    wakeRec.continuous = true;
    wakeRec.interimResults = true;
    wakeRec.lang = 'en-US';

    isWakeListeningRef.current = true;

    wakeRec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const speech = event.results[i][0].transcript.toLowerCase();
        if (speech.includes('hey aura') || speech.includes('hey, aura') || speech.includes('aura') || speech.includes('hey orra') || speech.includes('orra') || speech.includes('hey ara')) {
          wakeRec.onend = null; // Prevent loops
          wakeRec.stop();
          isWakeListeningRef.current = false;
          playChime(true);
          
          // Open the panel if closed
          if (!isOpenRef.current) {
            setIsOpen(true);
          }
          
          setTimeout(() => {
            startCommandListener();
          }, 400);
          break;
        }
      }
    };

    wakeRec.onerror = (e: any) => {
      console.warn('Wake word listener error (suppressed):', e.error);
      isWakeListeningRef.current = false;
    };

    wakeRec.onend = () => {
      isWakeListeningRef.current = false;
      // Re-enable if wake word mode is still active and no other process is running
      if (isWakeWordActiveRef.current && !isListeningRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
        setTimeout(() => {
          if (isWakeWordActiveRef.current && !isListeningRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
            startWakeWordListener();
          }
        }, 1000); // 1-second delay throttle
      }
    };

    wakeWordRecRef.current = wakeRec;
    try {
      wakeRec.start();
    } catch(e) {
      console.warn('Failed to start wake word recording', e);
      isWakeListeningRef.current = false;
    }
  };

  // Toggle Wake Word switch
  const handleWakeWordToggle = () => {
    const nextVal = !isWakeWordActive;
    setIsWakeWordActive(nextVal);
  };

  // Process a user message
  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsThinkingSync(true);
    setErrorMsg('');

    if (synthRef.current) synthRef.current.cancel();
    setIsSpeakingSync(false);

    // Client-side authentication guard
    if (!isAuthenticated) {
      setIsThinkingSync(false);
      const reply = "I would be delighted to assist you, but you must be signed in to access my private concierge services. Please sign in using the button in the navigation bar.";
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      speak(reply);
      return;
    }

    try {
      const res = await chatApi.sendMessage(text, sessionId);
      const reply = res.data.data.reply;
      const newSessionId = res.data.data.sessionId;
      
      if (newSessionId) setSessionId(newSessionId);

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsThinkingSync(false);
      speak(reply);
    } catch (err: any) {
      console.error('AURA Voice assistant API error:', err);
      setIsThinkingSync(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Excuse me, I encountered a response delay. Please try again.' }]);
      speak('Excuse me, I encountered a response delay.');
      if (isWakeWordActiveRef.current && isOpenRef.current) {
        setTimeout(() => startWakeWordListener(), 300);
      }
    }
  };

  // Handle panel toggle
  const togglePanel = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!nextState) {
      // Clean up all sound and mic processes on close
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeakingSync(false);
      setIsListeningSync(false);
      
      if (recognitionRef.current) {
        const rec = recognitionRef.current;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        try { rec.stop(); } catch(e){}
        recognitionRef.current = null;
      }

      // Keep wake word listening active if enabled
      if (isWakeWordActiveRef.current) {
        setTimeout(() => startWakeWordListener(), 500);
      } else {
        stopWakeWordListener();
      }
    } else {
      setTimeout(() => {
        if (messages.length > 0) {
          speak(messages[messages.length - 1].text);
        } else {
          speak('Hello, I am Aura. How may I assist you today?');
        }
      }, 500);
      if (isWakeWordActiveRef.current) {
        setTimeout(() => startWakeWordListener(), 600);
      }
    }
  };

  return (
    <div className="aura-assistant-container">
      {/* Floating Gold Button */}
      <button 
        className={`aura-floating-button ${isOpen ? 'active' : ''} animate-fade`}
        onClick={togglePanel}
        aria-label="Aura Voice Assistant"
      >
        <span className="aura-btn-icon">✦</span>
        {!isOpen && <span className="aura-btn-label">AURA</span>}
      </button>

      {/* Glassmorphic Concierge Drawers */}
      {isOpen && (
        <div className="aura-panel glass-panel animate-fade">
          <div className="aura-panel-header">
            <div className="aura-header-left">
              <span className="aura-badge">✦</span>
              <div>
                <h3 className="aura-title">AURA CONCIERGE</h3>
                <span className="aura-sub">Luxury Concierge</span>
              </div>
            </div>
            <button className="aura-close-btn" onClick={togglePanel}>✕</button>
          </div>


          {/* Simple Scrollable Message Transcript */}
          <div className="aura-transcript">
            {messages.map((msg, i) => (
              <div key={i} className={`aura-bubble-row ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                <div className="aura-bubble">
                  {msg.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="aura-bubble-row ai">
                <div className="aura-bubble thinking">
                  <span className="aura-dot"></span>
                  <span className="aura-dot"></span>
                  <span className="aura-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Waveform Visualizers */}
          {(isListening || isSpeaking) && (
            <div className={`aura-waveform ${isListening ? 'listening' : 'speaking'}`}>
              <div className="aura-wave-bar"></div>
              <div className="aura-wave-bar"></div>
              <div className="aura-wave-bar"></div>
              <div className="aura-wave-bar"></div>
              <div className="aura-wave-bar"></div>
            </div>
          )}

          {/* Assistant status text info */}
          <div className="aura-status-bar">
            {isListening && <span className="status-indicator listening">Listening...</span>}
            {isSpeaking && <span className="status-indicator speaking">Aura is speaking</span>}
            {isWakeWordActive && !isListening && !isSpeaking && (
              <span className="status-indicator wake">Say "Hey Aura"</span>
            )}
            {errorMsg && <span className="status-indicator error">{errorMsg}</span>}
          </div>

          {/* Controls Panel */}
          <div className="aura-panel-controls">
            <div className="aura-switches">
              <label className="aura-switch-label">
                <input 
                  type="checkbox" 
                  checked={isWakeWordActive} 
                  onChange={handleWakeWordToggle}
                />
                <span className="switch-text">Wake Word</span>
              </label>

              <button 
                className={`aura-mute-btn ${isMuted ? 'muted' : ''}`}
                onClick={() => {
                  const nextVal = !isMuted;
                  setIsMuted(nextVal);
                  if (nextVal && synthRef.current) {
                    synthRef.current.cancel();
                  }
                }}
                title={isMuted ? 'Unmute Aura Voice' : 'Mute Aura Voice'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>

            {/* Click to Talk mic & fallback text inputs */}
            <div className="aura-input-row">
              <button 
                className={`aura-mic-btn ${isListening ? 'active' : ''}`}
                onClick={isListening ? () => stopCommandListener(true) : startCommandListener}
                disabled={isThinking}
                title={isListening ? "Tap to send" : "Tap to speak"}
              >
                🎤
              </button>
              <input
                type="text"
                className="aura-text-input"
                placeholder="Ask Aura something..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUserMessage(inputText);
                }}
                disabled={isListening || isThinking}
              />
              <button
                className="aura-send-btn btn btn-primary"
                onClick={() => handleUserMessage(inputText)}
                disabled={isListening || isThinking || !inputText.trim()}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
