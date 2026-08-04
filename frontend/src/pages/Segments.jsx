import { useEffect, useState } from "react";
import { Users, PieChart, Clock, Target } from "lucide-react";
import api from "../api";
import "../styles/dashboard.css";

const ACCENT_COLORS = [
    { color: "#00d09c", bg: "rgba(0,208,156,0.1)"  },
    { color: "#121212", bg: "#f1f5f9"  },
    { color: "#f5a623", bg: "rgba(245,166,35,0.1)"  },
    { color: "#3b82f6", bg: "rgba(59,130,246,0.1)"   },
];

export default function Segments() {

    const [segments, setSegments] = useState([]);

    useEffect(() => {
        api.get("/segment-analytics").then((res) => setSegments(res.data));
    }, []);

    return (
        <div className="segments-page">

            <div className="page-header animate-fade-up">
                <p className="eyebrow">Customer Intelligence</p>
                <h1>Customer Segments</h1>
                <p className="hero-copy">
                    Understand customer behavior, revenue contribution, and engagement
                    patterns across all segments to drive targeted retention strategies.
                </p>
            </div>

            <div className="segment-grid animate-fade-up delay-1">
                {segments.map((segment, i) => {
                    const ac = ACCENT_COLORS[i % ACCENT_COLORS.length];
                    return (
                        <div
                            key={segment.segment}
                            className="segment-card section-card"
                            style={{ borderTop: `2px solid ${ac.color}` }}
                        >
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                                <h3 style={{ margin: 0, fontSize: "17px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                                    {segment.segment}
                                </h3>
                                <div style={{
                                    width: 34, height: 34, borderRadius: "9px",
                                    background: ac.bg, display: "flex",
                                    alignItems: "center", justifyContent: "center"
                                }}>
                                    <Users size={15} color={ac.color} />
                                </div>
                            </div>

                            <div className="segment-stat">
                                <span>Customers</span>
                                <strong>{segment.customers.toLocaleString()}</strong>
                            </div>
                            <div className="segment-stat">
                                <span>Avg Revenue</span>
                                <strong>£{Math.round(segment.avg_revenue).toLocaleString()}</strong>
                            </div>
                            <div className="segment-stat">
                                <span>Avg Frequency</span>
                                <strong>{segment.avg_frequency} orders</strong>
                            </div>
                            <div className="segment-stat">
                                <span>Avg Recency</span>
                                <strong>{segment.avg_recency}d ago</strong>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="insights-panel section-card animate-fade-up delay-2">
                <div className="card-header">
                    <h2 style={{ fontSize: "17px", fontFamily: "var(--font-display)", fontWeight: 700, margin: 0 }}>
                        Executive Insights
                    </h2>
                    <span className="card-label">AI Summary</span>
                </div>
                <ul>
                    <li>VIP customers contribute the highest revenue per customer and should be prioritized for retention programs.</li>
                    <li>Regular customers form the majority of the customer base and represent the best conversion opportunity to VIP tier.</li>
                    <li>Low-value customers show the highest inactivity — re-engagement campaigns can recover significant revenue.</li>
                    <li>Retention campaigns should focus on converting Regular customers into VIP customers through personalized incentives.</li>
                </ul>
            </div>

        </div>
    );
}