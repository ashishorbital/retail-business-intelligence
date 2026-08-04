import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    CartesianGrid
} from "recharts";

const COLORS = ["#00d09c", "#121212", "#f5a623", "#3b82f6"];

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
                <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {payload[0].value.toLocaleString()} customers
                </p>
            </div>
        );
    }
    return null;
};

export default function SegmentChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={270}>
            <BarChart
                data={data}
                margin={{ top: 8, right: 4, left: 0, bottom: 20 }}
                barCategoryGap="35%"
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                />

                <XAxis
                    dataKey="segment"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    interval={0}
                />

                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    width={40}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.85}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}