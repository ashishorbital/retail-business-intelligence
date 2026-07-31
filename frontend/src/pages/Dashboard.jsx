import { useEffect, useState } from "react";

import api from "../api";

import KPIMetric from "../components/KPIMetric";
import SegmentChart from "../components/SegmentChart";
import ForecastChart from "../components/ForecastChart";

import KPICard from "../components/KPICard";

export default function Dashboard() {

    const [kpis, setKpis] = useState(null);
    const [segments, setSegments] = useState([]);
    const [forecast, setForecast] = useState([]);

    useEffect(() => {

        api
            .get("/kpis")
            .then((res) => setKpis(res.data));

        api
            .get("/segment-summary")
            .then((res) => setSegments(res.data));

        api
            .get("/forecast")
            .then((res) => setForecast(res.data));

    }, []);

    if (!kpis) {
        return <h2 className="loading-pulse" style={{color: 'var(--text-muted)'}}>Loading Dashboard...</h2>;
    }

    return (
        <section className="dashboard">

            <div className="hero animate-fade-up">

                <p className="type-1" style={{textTransform: 'uppercase'}}>
                    Retail Decision Intelligence Platform
                </p>

                <h1 className="type-3">
                    Dashboard
                </h1>

                <p className="type-2" style={{maxWidth: '600px'}}>
                    Across {kpis.customers.toLocaleString()}
                    {" "}customers,
                    {" "}
                    {kpis.vip_customers.toLocaleString()}
                    {" "}are classified as VIP customers with projected revenue
                    of £{Math.round(
                        kpis.forecast_revenue
                    ).toLocaleString()}
                    {" "}over the next 30 days.
                </p>

            </div>

            <div className="kpi-grid animate-fade-up delay-1">

                <KPICard
                    title="Customers"
                    value={kpis.customers.toLocaleString()}
                />

                <KPICard
                    title="VIP Customers"
                    value={kpis.vip_customers.toLocaleString()}
                />

                <KPICard
                    title="Average CLV"
                    value={`£${Math.round(
                        kpis.avg_clv
                    ).toLocaleString()}`}
                />

                <KPICard
                    title="Forecast Revenue"
                    value={`£${(
                        kpis.forecast_revenue /
                        1000000
                    ).toFixed(2)}M`}
                />

            </div>

            <div
                className="animate-fade-up delay-2"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginTop: "60px"
                }}
            >

                <div className="section-card">

                    <h3>
                        Customer Landscape
                    </h3>

                    <SegmentChart
                        data={segments}
                    />

                </div>

                <div className="section-card">

                    <h3>
                        Revenue Outlook
                    </h3>

                    <ForecastChart
                        data={forecast}
                    />

                </div>

            </div>

        </section>
    );
}