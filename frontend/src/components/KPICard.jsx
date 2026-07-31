export default function KPICard({
    title,
    value,
    subtitle
}) {
    return (
        <div className="kpi-card">

            <div className="type-1" style={{textTransform: 'uppercase', color: 'var(--color-low-confidence)'}}>
                {title}
            </div>

            <div className="type-4">
                {value}
            </div>

            {subtitle && (
                <div className="kpi-subtitle">
                    {subtitle}
                </div>
            )}

        </div>
    );
}