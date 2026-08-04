import { useEffect, useState } from "react";
import { Users, Crown, DollarSign, BarChart2, Clock } from "lucide-react";
import api from "../api";
import KPICard from "../components/KPICard";
import SegmentChart from "../components/SegmentChart";
import ForecastChart from "../components/ForecastChart";
import "../styles/dashboard.css";

export default function Dashboard() {

    const [kpis, setKpis] = useState(null);
    const [segments, setSegments] = useState([]);
    const [forecast, setForecast] = useState([]);

    useEffect(() => {
        api.get("/kpis").then((res) => setKpis(res.data));
        api.get("/segment-summary").then((res) => setSegments(res.data));
        api.get("/forecast").then((res) => setForecast(res.data));
    }, []);

    const now = new Date();
    const timeStr = now.toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
    });

    if (!kpis) {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", marginTop: "80px" }}>
                <div className="skeleton" style={{ width: 200, height: 20 }} />
            </div>
        );
    }

    return (
        <section className="dashboard">

            {/* ── Hero Row ── */}
            <div className="animate-fade-up" style={{ marginBottom: "32px" }}>
                <p className="eyebrow">Retail Decision Intelligence</p>
                <div className="dashboard-hero">
                    <div className="dashboard-hero-left">
                        <h1 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "34px",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1,
                            color: "var(--text-primary)",
                            marginBottom: "10px"
                        }}>
                            Sales Dashboard
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "540px", lineHeight: 1.7 }}>
                            Tracking{" "}
                            <strong style={{ color: "var(--text-primary)" }}>
                                {kpis.customers.toLocaleString()}
                            </strong>{" "}
                            customers across all segments, with{" "}
                            <strong style={{ color: "var(--accent)" }}>
                                {kpis.vip_customers.toLocaleString()} VIP accounts
                            </strong>{" "}
                            generating £{Math.round(kpis.forecast_revenue).toLocaleString()} forecast revenue.
                        </p>
                    </div>
                    <div className="dashboard-time-badge">
                        <Clock size={14} />
                        {timeStr}
                    </div>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="kpi-grid animate-fade-up delay-1">
                <KPICard
                    title="Total Customers"
                    value={kpis.customers.toLocaleString()}
                    accent={1}
                    icon={<Users size={17} />}
                    trend="up"
                    trendValue="Active base"
                />
                <KPICard
                    title="VIP Customers"
                    value={kpis.vip_customers.toLocaleString()}
                    accent={3}
                    icon={<Crown size={17} />}
                    subtitle="High-value tier"
                />
                <KPICard
                    title="Average CLV"
                    value={`£${Math.round(kpis.avg_clv).toLocaleString()}`}
                    accent={2}
                    icon={<DollarSign size={17} />}
                    trend="up"
                    trendValue="Per customer"
                />
                <KPICard
                    title="Forecast Revenue"
                    value={`£${(kpis.forecast_revenue / 1_000_000).toFixed(2)}M`}
                    accent={4}
                    icon={<BarChart2 size={17} />}
                    subtitle="Next 30 days"
                />
            </div>

            {/* ── Charts Row ── */}
            <div className="dashboard-charts-grid animate-fade-up delay-2">

                <div className="section-card">
                    <div className="card-header">
                        <h3>Customer Landscape</h3>
                        <span className="card-label">By segment</span>
                    </div>
                    <SegmentChart data={segments} />
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h3>Revenue Outlook</h3>
                        <span className="card-label">30-day forecast</span>
                    </div>
                    <ForecastChart data={forecast} />
                </div>

            </div>

        </section>
    );
}