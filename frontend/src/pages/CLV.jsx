import { useState } from "react";
import { Search, User, Crown, DollarSign, ShoppingCart, Package, Clock } from "lucide-react";
import api from "../api";
import "../styles/dashboard.css";

export default function CLV() {

    const [customerId, setCustomerId] = useState("");
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const searchCustomer = async () => {
        if (!customerId.trim()) {
            setError("Please enter a Customer ID");
            setCustomer(null);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await api.get(`/clv/${customerId}`);

            if (!res.data?.found) {
                setCustomer(null);
                setError(res.data?.message || "Customer ID not found");
                return;
            }

            setCustomer(res.data);
            setError("");

        } catch (err) {
            console.error(err);
            setCustomer(null);
            setError("Unable to fetch customer information");
        } finally {
            setLoading(false);
        }
    };

    const getTierClass = (tier) => {
        if (tier === "High")   return "tier-high";
        if (tier === "Medium") return "tier-medium";
        return "tier-low";
    };

    const metrics = customer?.found ? [
        { label: "Predicted CLV",           value: `£${customer.predicted_clv.toLocaleString()}`,      icon: <Crown size={16} />,       accent: "rgba(0,208,156,0.1)",  color: "#00d09c" },
        { label: "Total Revenue",            value: `£${customer.total_revenue.toLocaleString()}`,      icon: <DollarSign size={16} />,  accent: "#f1f5f9", color: "#121212" },
        { label: "Orders",                   value: customer.purchase_frequency,                        icon: <ShoppingCart size={16} />,accent: "rgba(245,166,35,0.1)", color: "#f5a623" },
        { label: "Avg Order Value",          value: `£${customer.avg_order_value.toLocaleString()}`,    icon: <DollarSign size={16} />,  accent: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
        { label: "Unique Products",          value: customer.unique_products,                           icon: <Package size={16} />,     accent: "rgba(0,208,156,0.1)", color: "#00d09c" },
        { label: "Days Since Last Purchase", value: `${customer.days_since_last_purchase}d`,           icon: <Clock size={16} />,       accent: "rgba(235,91,60,0.1)",  color: "#eb5b3c" },
    ] : [];

    return (
        <div className="clv-page">

            <div className="page-header animate-fade-up">
                <p className="eyebrow">Customer Intelligence</p>
                <h1>Customer Value</h1>
                <p className="hero-copy">
                    Analyze customer lifetime value and purchasing behavior
                    using machine learning predictions.
                </p>
            </div>

            {/* Search */}
            <div className="search-panel animate-fade-up delay-1">
                <div style={{ position: "relative", flex: 1 }}>
                    <Search
                        size={15}
                        style={{
                            position: "absolute", left: "14px",
                            top: "50%", transform: "translateY(-50%)",
                            color: "var(--text-muted)", pointerEvents: "none"
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Enter Customer ID..."
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") searchCustomer(); }}
                        style={{ paddingLeft: "40px" }}
                    />
                </div>
                <button onClick={searchCustomer} disabled={loading}>
                    {loading ? "Searching..." : "Analyze Customer"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="error-card animate-fade-up">
                    {error}
                </div>
            )}

            {/* Results */}
            {customer?.found && (
                <>
                    {/* Profile Header */}
                    <div className="customer-profile animate-fade-up delay-1">
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: "12px",
                                background: "var(--accent-subtle)",
                                border: "1px solid rgba(0,208,156,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <User size={20} color="var(--accent)" />
                            </div>
                            <div>
                                <span className="profile-label">Customer ID</span>
                                <h2>#{customer.customer_id}</h2>
                            </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <span className="profile-label">Value Tier</span>
                            <div>
                                <span className={`tier-badge ${getTierClass(customer.tier)}`}>
                                    {customer.tier === "High" && <Crown size={12} style={{ marginRight: 5 }} />}
                                    {customer.tier} Value
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="customer-metrics animate-fade-up delay-2">
                        {metrics.map((m) => (
                            <div key={m.label} className="profile-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                    <span>{m.label}</span>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: "8px",
                                        background: m.accent, display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        color: m.color
                                    }}>
                                        {m.icon}
                                    </div>
                                </div>
                                <h3>{m.value}</h3>
                            </div>
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}