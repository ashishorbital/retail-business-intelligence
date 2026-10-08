import pandas as pd
from pathlib import Path

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent

RAW_FILE = BASE_DIR / "Online Retail.xlsx"

OUTPUT_DIR = BASE_DIR / "processed"
OUTPUT_FILE = OUTPUT_DIR / "customer_features.csv"

# ─────────────────────────────────────────────
# STEP 1 — LOAD
# ─────────────────────────────────────────────
def load_data(filepath):
    print(f"[1/4] Loading data from: {filepath}")

    if not Path(filepath).exists():
        raise FileNotFoundError(f"\nFile not found:\n{filepath}")

    ext = Path(filepath).suffix.lower()

    try:
        if ext == ".xlsx":
            df = pd.read_excel(filepath, engine="openpyxl")
        elif ext == ".xls":
            df = pd.read_excel(filepath, engine="xlrd")
        else:
            df = pd.read_csv(filepath)
    except Exception:
        df = pd.read_csv(filepath)

    print(f"      Loaded {len(df):,} rows × {len(df.columns)} columns")
    return df


# ─────────────────────────────────────────────
# STEP 2 — CLEAN
# ─────────────────────────────────────────────
def clean_data(df):
    print("\n[2/4] Cleaning data ...")

    original_rows = len(df)

    df = df.dropna(subset=["CustomerID"])

    df["Description"] = df["Description"].fillna("Unknown")

    df = df[df["Quantity"] > 0]

    df = df[df["UnitPrice"] > 0]

    df = df.drop_duplicates()

    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])

    df["CustomerID"] = df["CustomerID"].astype(int)

    df["Revenue"] = df["Quantity"] * df["UnitPrice"]

    cleaned_rows = len(df)

    print(
        f"      ✓ Cleaning complete: {cleaned_rows:,} rows remain "
        f"({cleaned_rows/original_rows*100:.1f}% retained)"
    )

    return df


# ─────────────────────────────────────────────
# STEP 3 — FEATURE ENGINEERING
# ─────────────────────────────────────────────
def engineer_features(df):
    print("\n[3/4] Engineering customer features ...")

    snapshot_date = df["InvoiceDate"].max()

    customer_df = df.groupby("CustomerID").agg(
        purchase_frequency=("InvoiceNo", "nunique"),
        total_revenue=("Revenue", "sum"),
        total_quantity=("Quantity", "sum"),
        last_purchase_date=("InvoiceDate", "max"),
        first_purchase_date=("InvoiceDate", "min"),
        unique_products=("StockCode", "nunique"),
    ).reset_index()

    customer_df["days_since_last_purchase"] = (
        snapshot_date - customer_df["last_purchase_date"]
    ).dt.days

    customer_df["customer_lifespan_days"] = (
        customer_df["last_purchase_date"]
        - customer_df["first_purchase_date"]
    ).dt.days

    customer_df["avg_order_value"] = (
        customer_df["total_revenue"]
        / customer_df["purchase_frequency"]
    ).round(2)

    customer_df["last_purchase_date"] = (
        customer_df["last_purchase_date"]
        .dt.strftime("%Y-%m-%d")
    )

    customer_df["first_purchase_date"] = (
        customer_df["first_purchase_date"]
        .dt.strftime("%Y-%m-%d")
    )

    print(f"      ✓ Features built for {len(customer_df):,} customers")

    return customer_df


# ─────────────────────────────────────────────
# STEP 4 — SAVE
# ─────────────────────────────────────────────
def save_features(df, output_path):
    print(f"\n[4/4] Saving customer features to:\n{output_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(output_path, index=False)

    print(f"      ✓ Saved {len(df):,} rows")


# ─────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────
def run_pipeline():
    print("=" * 52)
    print("   DATA PREPROCESSING & FEATURE ENGINEERING")
    print("=" * 52)

    print("\nDetected paths:")
    print("RAW_FILE   :", RAW_FILE)
    print("Exists     :", RAW_FILE.exists())
    print("OUTPUT_FILE:", OUTPUT_FILE)

    df_raw = load_data(RAW_FILE)
    df_clean = clean_data(df_raw)
    df_features = engineer_features(df_clean)
    save_features(df_features, OUTPUT_FILE)

    print("\n✅ Pipeline complete!")
    print("=" * 52)

    return df_clean, df_features


if __name__ == "__main__":
    run_pipeline()