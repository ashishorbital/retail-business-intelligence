import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

OUTPUTS_DIR = BASE_DIR / "outputs"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"

def ingest_all():
    chunks = []

    # 1. Forecast
    forecast_file = OUTPUTS_DIR / "forecast.csv"
    if forecast_file.exists():
        df = pd.read_csv(forecast_file)
        for _, row in df.iterrows():
            text = f"Sales Forecast for {row['date']}: Predicted Revenue is £{row['predicted_revenue']}."
            chunks.append({
                "id": f"forecast_{row['date']}",
                "text": text,
                "metadata": {
                    "source": "forecast.csv",
                    "record_type": "forecast",
                    "date": str(row['date'])
                }
            })

    # 2. Customer Segments
    seg_file = OUTPUTS_DIR / "customer_segments.csv"
    if seg_file.exists():
        df = pd.read_csv(seg_file)
        # We might have too many customers, let's aggregate or just sample the segments
        # Or better, create a summary chunk for segments
        segment_counts = df["segment"].value_counts().to_dict()
        for seg, count in segment_counts.items():
            text = f"Customer Segmentation Summary: There are {count} customers in the '{seg}' segment."
            chunks.append({
                "id": f"segment_summary_{seg.replace(' ', '_')}",
                "text": text,
                "metadata": {
                    "source": "customer_segments.csv",
                    "record_type": "segment_summary",
                    "segment": seg
                }
            })

    # 3. Association Rules (Recommendations)
    rules_file = OUTPUTS_DIR / "association_rules.csv"
    if rules_file.exists():
        df = pd.read_csv(rules_file)
        # Limit to top rules to avoid blowing up the index
        df = df.sort_values("lift", ascending=False).head(100)
        for idx, row in df.iterrows():
            ant = str(row['antecedents']).replace("frozenset({", "").replace("})", "").replace("'", "")
            con = str(row['consequents']).replace("frozenset({", "").replace("})", "").replace("'", "")
            text = f"Product Recommendation Rule: Customers who buy {ant} are also likely to buy {con}. (Confidence: {row['confidence']:.2f}, Lift: {row['lift']:.2f})"
            chunks.append({
                "id": f"rule_{idx}",
                "text": text,
                "metadata": {
                    "source": "association_rules.csv",
                    "record_type": "recommendation_rule"
                }
            })

    # 4. CLV (Customer Lifetime Value) - aggregate summary to avoid too many chunks
    clv_file = OUTPUTS_DIR / "clv_predictions.csv"
    if clv_file.exists():
        df = pd.read_csv(clv_file)
        avg_clv = df["predicted_clv"].mean()
        avg_aov = df["avg_order_value"].mean()
        text = f"Customer Lifetime Value (CLV) Summary: The average predicted CLV across all customers is £{avg_clv:.2f}. The average order value is £{avg_aov:.2f}."
        chunks.append({
            "id": "clv_summary",
            "text": text,
            "metadata": {
                "source": "clv_predictions.csv",
                "record_type": "clv_summary"
            }
        })
        
        tier_counts = df["clv_tier"].value_counts().to_dict()
        for tier, count in tier_counts.items():
            text = f"CLV Tier Summary: There are {count} customers in the '{tier}' tier."
            chunks.append({
                "id": f"clv_tier_{tier}",
                "text": text,
                "metadata": {
                    "source": "clv_predictions.csv",
                    "record_type": "clv_tier_summary",
                    "tier": tier
                }
            })

    return chunks

if __name__ == "__main__":
    chunks = ingest_all()
    print(f"Ingested {len(chunks)} chunks.")
    print("Sample:", chunks[0] if chunks else "No data")
