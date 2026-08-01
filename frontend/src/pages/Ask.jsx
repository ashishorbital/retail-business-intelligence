import { useState, useRef } from "react";
import { MessageSquare, Send, Sparkles, Bot, User } from "lucide-react";
import api from "../api";

export default function Ask() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
                { role: "ai", text: "Sorry, I couldn't fetch an answer right now. Please try again." }
            ]);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    const SUGGESTIONS = [
        "What is the revenue forecast for next week?",
        "Show me the top VIP customers",
        "Summarize customer segments",
        "What products are frequently bought together?",
    ];

    return (
        <div style={{ maxWidth: "900px" }}>

            {/* Header */}
            <div className="page-header animate-fade-up">
                <p className="eyebrow">Natural Language Query</p>
                <h1>Ask AI</h1>
                <p className="hero-copy">
                    Query your inventory, sales, customer data, and forecasts using
                    plain English. Powered by RAG over your real data.
                </p>
            </div>

            {/* Chat container */}
            <div className="chat-container animate-fade-up delay-1">
                <div className="chat-history">

                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div style={{ textAlign: "center", padding: "32px 20px" }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: "16px",
                                background: "var(--accent-subtle)",
                                border: "1px solid rgba(99,102,241,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px"
                            }}>
                                <Sparkles size={26} color="#a5b4fc" />
                            </div>
                            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                                Ask anything about your data
                            </p>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                                Try one of these suggestions:
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        style={{
                                            background: "var(--bg-surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px",
                                            padding: "8px 14px",
                                            fontSize: "12.5px",
                                            color: "var(--text-secondary)",
                                            cursor: "pointer",
                                            transition: "all 0.15s",
                                            fontFamily: "var(--font-body)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "var(--accent)";
                                            e.currentTarget.style.color = "#a5b4fc";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "var(--border)";
                                            e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            {/* Avatar + message */}
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                flexDirection: msg.role === "user" ? "row-reverse" : "row"
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, var(--accent-from), var(--accent-to))"
                                        : "var(--bg-surface)",
                                    border: msg.role === "ai" ? "1px solid var(--border)" : "none"
                                }}>
                                    {msg.role === "user"
                                        ? <User size={14} color="white" />
                                        : <Bot size={14} color="#a5b4fc" />
                                    }
                                </div>

                                <div className={`chat-message ${msg.role}`}>
                                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>

                                    {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                                        <details style={{ marginTop: "10px" }}>
                                            <summary style={{
                                                cursor: "pointer",
                                                fontSize: "11.5px",
                                                color: "var(--text-muted)",
                                                fontWeight: 600,
                                                outline: "none",
                                                userSelect: "none"
                                            }}>
                                                View {msg.sources.length} sources
                                            </summary>
                                            <ul style={{
                                                marginTop: "8px", paddingLeft: "14px",
                                                marginBottom: 0, fontSize: "12px",
                                                color: "var(--text-muted)", lineHeight: 1.7
                                            }}>
                                                {msg.sources.map((src, i) => (
                                                    <li key={i}>
                                                        {src.source} ({src.record_type})
                                                        {src.date && ` — ${src.date}`}
                                                        {src.segment && ` — ${src.segment}`}
                                                        {src.tier && ` — ${src.tier}`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "8px",
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <Bot size={14} color="#a5b4fc" />
                            </div>
                            <div className="chat-message ai" style={{ display: "flex", gap: "6px", alignItems: "center", padding: "16px 18px" }}>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: "var(--text-muted)",
                                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", width: "100%" }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask anything about your business data..."
                            disabled={loading}
                            className="chat-input"
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="chat-btn"
                            style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <Send size={14} />
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
