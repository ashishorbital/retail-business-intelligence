import { useEffect, useState } from "react";
import { TrendingUp, Activity, Zap, AlertTriangle } from "lucide-react";
import api from "../api";
import "../styles/dashboard.css";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-hover)",
                borderRadius: "10px",
                padding: "10px 14px",
                boxShadow: "var(--shadow-lg)",
                fontSize: "13px"
            }}>
                <p style={{ color: "var(--text-muted)", marginBottom: "4px", fontSize: "11px" }}>{label}</p>
                <p style={{ color: "#a5b4fc", fontWeight: 600 }}>
                    £{Math.round(payload[0].value).toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function Forecast() {

    const [forecast, setForecast] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        api.get("/forecast").then((res) => setForecast(res.data));
        api.get("/forecast-summary").then((res) => setSummary(res.data));
    }, []);

    const formatCurrency = (value) =>
        `£${Math.round(value).toLocaleString()}`;

    if (!summary) {
        return (
            <div className="forecast-page">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="skeleton" style={{ height: 36, width: "40%" }} />
                    <div className="skeleton" style={{ height: 18, width: "60%" }} />
                </div>
            </div>
        );
    }

    return (
        <div className="forecast-page">

            {/* Header */}
            <div className="page-header animate-fade-up">
                <p className="eyebrow">Revenue Intelligence</p>
                <h1>Revenue Outlook</h1>
                <p className="hero-copy">
                    Forecasted sales performance for the next 30 days, generated
                    using machine learning models trained on your transaction history.
                </p>
            </div>

            {/* KPI Row */}
            <div className="forecast-summary-grid animate-fade-up delay-1">

                <div className="forecast-card" style={{ borderTop: "2px solid #6366f1" }}>
                    <span>Total Forecast Revenue</span>
                    <h2>{formatCurrency(summary.forecast_revenue)}</h2>
                </div>

                <div className="forecast-card" style={{ borderTop: "2px solid #10b981" }}>
                    <span>Average Daily Revenue</span>
                    <h2>{formatCurrency(summary.average_daily)}</h2>
                </div>

                <div className="forecast-card" style={{ borderTop: "2px solid #f59e0b" }}>
                    <span>Best Day</span>
                    <h2>{formatCurrency(summary.best_day)}</h2>
                </div>

                <div className="forecast-card" style={{ borderTop: "2px solid #ef4444" }}>
                    <span>Worst Day</span>
                    <h2>{formatCurrency(summary.worst_day)}</h2>
                </div>

            </div>

            {/* Chart */}
            <div className="section-card animate-fade-up delay-2">
                <div className="card-header">
                    <h3>30-Day Revenue Forecast</h3>
                    <span className="card-label">ML Prediction</span>
                </div>

                <ResponsiveContainer width="100%" height={420}>
                    <AreaChart data={forecast} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                            tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                            width={56}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="predicted_revenue"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="url(#revGrad)"
                            dot={false}
                            activeDot={{ r: 5, fill: "#6366f1", stroke: "var(--bg-card)", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="section-card animate-fade-up delay-3">
                <div className="card-header">
                    <h3>Business Insights</h3>
                    <span className="card-label">AI Analysis</span>
                </div>

                <div className="forecast-insights">

                    <div className="insight-item">
                        <strong>
                            <TrendingUp size={15} color="var(--success)" />
                            Peak Revenue Day
                        </strong>
                        <p>
                            Highest projected revenue is{" "}
                            £{Math.round(summary.best_day).toLocaleString()}{" "}
                            on {summary.best_day_date}.
                        </p>
                    </div>

                    <div className="insight-item">
                        <strong>
                            <AlertTriangle size={15} color="var(--danger)" />
                            Lowest Revenue Day
                        </strong>
                        <p>
                            Revenue is expected to dip to{" "}
                            £{Math.round(summary.worst_day).toLocaleString()}{" "}
                            on {summary.worst_day_date}.
                        </p>
                    </div>

                    <div className="insight-item">
                        <strong>
                            <Activity size={15} color="var(--info)" />
                            Revenue Volatility
                        </strong>
                        <p>
                            Forecast volatility is{" "}
                            {summary.volatility}%,{" "}
                            indicating
                            {summary.volatility < 15
                                ? " stable demand across the period."
                                : " significant fluctuations ahead."}
                        </p>
                    </div>

                    <div className="insight-item">
                        <strong>
                            <Zap size={15} color="var(--warning)" />
                            Revenue Opportunity
                        </strong>
                        <p>
                            Projected revenue for the next 30 days is{" "}
                            £{Math.round(summary.forecast_revenue).toLocaleString()}.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}