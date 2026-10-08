from pathlib import Path
import pandas as pd
import numpy as np
import pickle

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error
)

# =====================================================
# CONFIG
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_FILE = BASE_DIR / "data" / "Online Retail.xlsx"

MODEL_PATH = BASE_DIR / "models" / "forecast_model.pkl"
OUTPUT_FILE = BASE_DIR / "outputs" / "forecast.csv"

FORECAST_DAYS = 30
TEST_DAYS = 30

# =====================================================
# LOAD DAILY SALES
# =====================================================

def load_daily_sales(path=RAW_FILE):

    try:
        df = pd.read_excel(path, engine="openpyxl")
    except Exception:
        df = pd.read_csv(path)

    df = df.dropna(subset=["CustomerID"])
    df = df[df["Quantity"] > 0]
    df = df[df["UnitPrice"] > 0]

    df["Revenue"] = df["Quantity"] * df["UnitPrice"]
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])

    daily = (
        df.groupby(df["InvoiceDate"].dt.date)
        .agg(revenue=("Revenue", "sum"))
        .reset_index()
    )

    daily.columns = ["date", "revenue"]

    daily["date"] = pd.to_datetime(daily["date"])

    daily = daily.sort_values("date").reset_index(drop=True)

    print(f"[FC] Loaded {len(daily)} days")

    return daily

# =====================================================
# FEATURE ENGINEERING
# =====================================================

def create_features(df):

    df = df.copy()

    df["lag_1"] = df["revenue"].shift(1)
    df["lag_7"] = df["revenue"].shift(7)
    df["lag_14"] = df["revenue"].shift(14)
    df["lag_30"] = df["revenue"].shift(30)

    df["rolling_7"] = (
        df["revenue"]
        .rolling(7)
        .mean()
        .shift(1)
    )

    df["rolling_14"] = (
        df["revenue"]
        .rolling(14)
        .mean()
        .shift(1)
    )

    df["rolling_30"] = (
        df["revenue"]
        .rolling(30)
        .mean()
        .shift(1)
    )

    df["dayofweek"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["quarter"] = df["date"].dt.quarter

    df["weekofyear"] = (
        df["date"]
        .dt.isocalendar()
        .week
        .astype(int)
    )

    df["day_of_month"] = df["date"].dt.day

    df["is_weekend"] = (
        df["dayofweek"] >= 5
    ).astype(int)

    df = df.dropna()

    return df

# =====================================================
# TRAIN MODEL
# =====================================================

def train_model(df):

    features = [
        "lag_1",
        "lag_7",
        "lag_14",
        "lag_30",
        "rolling_7",
        "rolling_14",
        "rolling_30",
        "dayofweek",
        "month",
        "quarter",
        "weekofyear",
        "day_of_month",
        "is_weekend"
    ]

    train = df.iloc[:-TEST_DAYS]
    test = df.iloc[-TEST_DAYS:]

    X_train = train[features]
    y_train = train["revenue"]

    X_test = test[features]
    y_test = test["revenue"]

    model = RandomForestRegressor(
    n_estimators=500,
    max_depth=10,
    min_samples_leaf=5,
    min_samples_split=10,
    random_state=42,
    n_jobs=-1
)

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    mae = mean_absolute_error(y_test, preds)
    mape = mean_absolute_percentage_error(y_test, preds) * 100

    print(f"[FC] Test Days : {TEST_DAYS}")
    print(f"[FC] MAE       : £{mae:,.2f}")
    print(f"[FC] MAPE      : {mape:.2f}%")

    print("\n[FC] Feature Importance:")

    fi = (
        pd.Series(
            model.feature_importances_,
            index=features
        )
        .sort_values(ascending=False)
    )

    for feat, imp in fi.items():

        bar = "█" * int(imp * 40)

        print(
            f"      {feat:<20} {bar} {imp:.3f}"
        )

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    print(f"\n[FC] Model saved → {MODEL_PATH}")

    return model

# =====================================================
# FORECAST FUTURE
# =====================================================

def forecast_future(df, model):

    history = df[["date", "revenue"]].copy()

    predictions = []

    for _ in range(FORECAST_DAYS):

        next_date = (
            history["date"].max()
            + pd.Timedelta(days=1)
        )

        row = {
            "lag_1": history.iloc[-1]["revenue"],
            "lag_7": history.iloc[-7]["revenue"],
            "lag_14": history.iloc[-14]["revenue"],
            "lag_30": history.iloc[-30]["revenue"],

            "rolling_7":
                history["revenue"].tail(7).mean(),

            "rolling_14":
                history["revenue"].tail(14).mean(),

            "rolling_30":
                history["revenue"].tail(30).mean(),

            "dayofweek":
                next_date.dayofweek,

            "month":
                next_date.month,

            "quarter":
                next_date.quarter,

            "weekofyear":
                int(next_date.isocalendar().week),

            "day_of_month":
                next_date.day,

            "is_weekend":
                int(next_date.dayofweek >= 5)
        }

        pred = model.predict(
            pd.DataFrame([row])
        )[0]

        pred = max(pred, 0)

        predictions.append({
            "date": next_date,
            "predicted_revenue": round(pred, 2)
        })

        history = pd.concat(
            [
                history,
                pd.DataFrame([{
                    "date": next_date,
                    "revenue": pred
                }])
            ],
            ignore_index=True
        )

    return pd.DataFrame(predictions)

# =====================================================
# MAIN
# =====================================================

def run():

    print("\n" + "=" * 52)
    print("   MODULE 4 — SALES FORECASTING (Random Forest)")
    print("=" * 52)

    daily = load_daily_sales()

    feature_df = create_features(daily)

    model = train_model(feature_df)

    forecast = forecast_future(
        feature_df,
        model
    )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    forecast.to_csv(
        OUTPUT_FILE,
        index=False
    )

    future_total = forecast["predicted_revenue"].sum()
    avg_daily = forecast["predicted_revenue"].mean()

    print(f"\n[FC] Forecast saved → {OUTPUT_FILE}")
    print(f"[FC] Next 30 Days Revenue : £{future_total:,.2f}")
    print(f"[FC] Avg Daily Revenue    : £{avg_daily:,.2f}")

    return forecast

if __name__ == "__main__":
    run()