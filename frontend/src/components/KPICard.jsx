import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function KPICard({
    title,
    value,
    subtitle,
    icon,
    accent = 1,
    trend,        // "up" | "down" | "neutral"
    trendValue,   // e.g. "+12.4%"
}) {
    return (
        <div className={`kpi-card kpi-card-accent-${accent}`}>

            {/* Top row: label + icon */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="kpi-title">{title}</div>
                {icon && (
                    <div className="kpi-icon-wrap">
                        {icon}
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="kpi-value">{value}</div>

            {/* Bottom: subtitle or trend */}
            <div className="kpi-subtitle">
                {trend === "up" && (
                    <>
                        <TrendingUp size={13} className="kpi-trend-up" />
                        <span className="kpi-trend-up">{trendValue}</span>
                    </>
                )}
                {trend === "down" && (
                    <>
                        <TrendingDown size={13} className="kpi-trend-down" />
                        <span className="kpi-trend-down">{trendValue}</span>
                    </>
                )}
                {(!trend || trend === "neutral") && trendValue && (
                    <>
                        <Minus size={13} style={{ color: "var(--text-muted)" }} />
                        <span>{trendValue}</span>
                    </>
                )}
                {subtitle && <span>{subtitle}</span>}
            </div>

        </div>
    );
}