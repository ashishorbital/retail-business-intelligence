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

export default function ForecastChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="forecastGradDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                />

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
                    width={52}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                    type="monotone"
                    dataKey="predicted_revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#forecastGradDash)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1", stroke: "var(--bg-card)", strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}