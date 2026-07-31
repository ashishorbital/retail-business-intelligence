import { useState } from "react";
import api from "../api";

export default function Ask() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = { role: "user", text: query };
        setMessages((prev) => [...prev, userMsg]);
        setQuery("");
        setLoading(true);

        try {
            const res = await api.post("/api/ask", { query: userMsg.text });
            const aiMsg = {
                role: "ai",
                text: res.data.answer,
                sources: res.data.sources
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "Error fetching answer." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="hero">
                <p className="type-1" style={{textTransform: 'uppercase'}}>Natural Language Query</p>
                <h2 className="type-4">Ask AI</h2>
                <p className="type-2" style={{maxWidth: '600px'}}>Query your inventory, sales, and forecasts using natural language.</p>
            </header>

            <div className="chat-container animate-fade-up delay-1">
                <div className="chat-history">
                    {messages.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                            Try asking: "What is the forecast for tomorrow?" or "Summarize VIP customers."
                        </p>
                    )}
                    
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className={`chat-message ${msg.role}`}>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                
                                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                                    <details style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <summary style={{ cursor: 'pointer', outline: 'none' }}>View Sources ({msg.sources.length})</summary>
                                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', marginBottom: 0 }}>
                                            {msg.sources.map((src, i) => (
                                                <li key={i} style={{ marginBottom: '0.25rem' }}>
                                                    {src.source} ({src.record_type})
                                                    {src.date && ` - ${src.date}`}
                                                    {src.segment && ` - ${src.segment}`}
                                                    {src.tier && ` - ${src.tier}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="chat-message ai loading-pulse" style={{ color: 'var(--text-muted)' }}>
                            <p style={{ margin: 0 }}>Thinking...</p>
                        </div>
                    )}
                </div>

                <div className="chat-input-area">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={loading}
                            className="chat-input"
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="chat-btn"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
