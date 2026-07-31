import { useEffect, useState } from "react";
import api from "../api";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

export default function Forecast() {

    const [forecast, setForecast] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {

        api
            .get("/forecast")
            .then((res) => setForecast(res.data));

        api
            .get("/forecast-summary")
            .then((res) => setSummary(res.data));

    }, []);

    const formatCurrency = (value) =>
        `£${Math.round(value).toLocaleString()}`;

    if (!summary) {
        return (
            <div className="page-header">
                <h1>Loading Forecast...</h1>
            </div>
        );
    }

    return (
        <div className="forecast-page">

            <div className="page-header">

                <p className="eyebrow">
                    Revenue Intelligence
                </p>

                <h1>
                    Revenue Outlook
                </h1>

                <p className="hero-copy">
                    Forecasted sales performance for the next
                    30 days generated using machine learning.
                </p>

            </div>

            <div className="forecast-summary-grid">

                <div className="forecast-card">
                    <span>Total Forecast Revenue</span>
                    <h2>
                        {formatCurrency(
                            summary.forecast_revenue
                        )}
                    </h2>
                </div>

                <div className="forecast-card">
                    <span>Average Daily Revenue</span>
                    <h2>
                        {formatCurrency(
                            summary.average_daily
                        )}
                    </h2>
                </div>

                <div className="forecast-card">
                    <span>Best Day</span>
                    <h2>
                        {formatCurrency(
                            summary.best_day
                        )}
                    </h2>
                </div>

                <div className="forecast-card">
                    <span>Worst Day</span>
                    <h2>
                        {formatCurrency(
                            summary.worst_day
                        )}
                    </h2>
                </div>

            </div>

            <div
                className="section-card"
                style={{ marginTop: "32px" }}
            >

                <h3>
                    30 Day Revenue Forecast
                </h3>

                <ResponsiveContainer
                    width="100%"
                    height={450}
                >

                    <LineChart data={forecast}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            opacity={0.3}
                        />

                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="predicted_revenue"
                            stroke="#111111"
                            strokeWidth={4}
                            dot={false}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <div
                className="section-card"
                style={{ marginTop: "32px" }}
            >

                <h3>
                    Business Insights
                </h3>

                <div className="forecast-insights">

                    <div className="insight-item">

                        <strong>
                            Peak Revenue Day
                        </strong>

                        <p>
                            Highest projected revenue is
                            £{Math.round(summary.best_day).toLocaleString()}
                            on {summary.best_day_date}.
                        </p>

                    </div>

                    <div className="insight-item">

                        <strong>
                            Lowest Revenue Day
                        </strong>

                        <p>
                            Revenue is expected to dip to
                            £{Math.round(summary.worst_day).toLocaleString()}
                            on {summary.worst_day_date}.
                        </p>

                    </div>

                    <div className="insight-item">

                        <strong>
                            Revenue Volatility
                        </strong>

                        <p>
                            Forecast volatility is
                            {summary.volatility}%,
                            indicating
                            {summary.volatility < 15
                                ? " stable demand."
                                : " significant fluctuations."}
                        </p>

                    </div>

                    <div className="insight-item">

                        <strong>
                            Revenue Opportunity
                        </strong>

                        <p>
                            Projected revenue for the next
                            30 days is
                            £{Math.round(summary.forecast_revenue).toLocaleString()}.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}