import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

export default function SegmentChart({
    data
}) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 40
                }}
            >
                <XAxis
                    dataKey="segment"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                />

                <YAxis
                    tickLine={false}
                    axisLine={false}
                />

                <Tooltip />

                <Bar
                    dataKey="count"
                    fill="#111111"
                    radius={0}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}