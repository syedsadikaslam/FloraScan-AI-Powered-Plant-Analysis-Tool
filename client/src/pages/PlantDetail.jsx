import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import AuthContext from "../context/AuthContext";

export default function PlantDetail() {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);

    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (token) fetchPlantData();
    }, [id, token]);

    /* ================= VOICE INTERACTION ================= */
    const startListening = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Voice input is not supported in this browser. Try Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setChatInput(transcript);
        };

        recognition.start();
    };

    const speakText = (text) => {
        if (!("speechSynthesis" in window)) {
            alert("Text-to-speech is not supported in this browser.");
            return;
        }
        window.speechSynthesis.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    /* ================= DATA FETCHING ================= */
    const fetchPlantData = async () => {
        try {
            const res = await api.get(`/api/analysis/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching plant details", error);
            setLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
        setChatInput("");

        try {
            const res = await api.post("/api/analysis/chat", {
                message: userMsg,
                context: data.result,
            });

            const reply = res.data.reply;
            setChatHistory((prev) => [...prev, { role: "ai", text: reply }]);
            speakText(reply); // Auto-speak the AI response
        } catch (error) {
            setChatHistory((prev) => [...prev, { role: "ai", text: "Error: Could not get response." }]);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    if (loading) return <p className="loading-text">Loading plant details...</p>;
    if (!data) return <p className="error-text">Plant not found.</p>;

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="page-container plant-detail"
        >
            <div className="detail-grid">
                <div className="image-section">
                    <img src={data.image} alt="Analyzed Plant" className="detail-image" />
                    <div className="analysis-content">
                        <h2>Analysis Result</h2>
                        <div className="markdown-result">
                            <ReactMarkdown>{data.result}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                <div className="chat-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2>💬 AI Plant Chat</h2>
                        <button
                            onClick={() => window.speechSynthesis.cancel()}
                            className="secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', width: 'auto', marginTop: 0 }}
                        >
                            <i className="fa-solid fa-volume-xmark"></i> Stop Audio
                        </button>
                    </div>

                    <div className="chat-box">
                        {chatHistory.length === 0 && <p className="chat-placeholder">Ask any question about this plant! (e.g., "How often should I water it?")</p>}
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.role}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <strong>{msg.role === "user" ? "You" : "FloraAI"}:</strong>
                                    {msg.role === "ai" && (
                                        <i
                                            className="fa-solid fa-volume-high"
                                            style={{ cursor: 'pointer', fontSize: '12px', color: '#6cff95' }}
                                            onClick={() => speakText(msg.text)}
                                            title="Read Aloud"
                                        ></i>
                                    )}
                                </div>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleChatSubmit} className="chat-input-form">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type or speak a question..."
                        />
                        <button type="button" onClick={startListening} className={isListening ? "listening" : ""} style={{ width: 'auto', padding: '0 15px', background: isListening ? '#e74c3c' : 'rgba(255,255,255,0.1)' }}>
                            <i className={`fa-solid ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                        </button>
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        </motion.main>
    );
}
