"""
MODULE 3 — PRODUCT RECOMMENDATION ENGINE
Model : Apriori + Association Rules
"""

from pathlib import Path
import pandas as pd
import pickle

from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

# =====================================================
# CONFIG
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_FILE = BASE_DIR / "data" / "Online Retail.xlsx"

RULES_FILE = BASE_DIR / "outputs" / "association_rules.csv"

MODEL_PATH = BASE_DIR / "models" / "recommendation_model.pkl"

# =====================================================
# LOAD DATA
# =====================================================

def load_transactions(path=RAW_FILE):

    if not Path(path).exists():
        raise FileNotFoundError(
            f"\nDataset not found:\n{path}"
        )

    try:
        df = pd.read_excel(path, engine="openpyxl")
    except Exception:
        df = pd.read_csv(path)

    df = df.dropna(
        subset=["CustomerID", "Description"]
    )

    df = df[df["Quantity"] > 0]
    df = df[df["UnitPrice"] > 0]

    df["Description"] = (
        df["Description"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    baskets = (
        df.groupby("InvoiceNo")["Description"]
        .apply(list)
        .tolist()
    )

    print(
        f"[REC] Loaded {len(baskets):,} transactions, "
        f"{df['Description'].nunique():,} unique products"
    )

    return baskets, df

# =====================================================
# BUILD RULES
# =====================================================

def build_rules(
    baskets,
    min_support=0.02,
    min_confidence=0.30,
    min_lift=1.50
):

    te = TransactionEncoder()

    te_array = te.fit_transform(baskets)

    df_encoded = pd.DataFrame(
        te_array,
        columns=te.columns_
    )

    freq_items = apriori(
        df_encoded,
        min_support=min_support,
        use_colnames=True
    )

    print(
        f"[REC] Found {len(freq_items):,} frequent itemsets"
    )

    rules = association_rules(
        freq_items,
        metric="lift",
        min_threshold=min_lift
    )

    rules = rules[
        rules["confidence"] >= min_confidence
    ]

    rules = (
        rules
        .sort_values("lift", ascending=False)
        .reset_index(drop=True)
    )

    rules["antecedents"] = (
        rules["antecedents"]
        .apply(lambda x: ", ".join(sorted(x)))
    )

    rules["consequents"] = (
        rules["consequents"]
        .apply(lambda x: ", ".join(sorted(x)))
    )

    print(
        f"[REC] Generated {len(rules):,} rules"
    )

    return rules

# =====================================================
# SAVE MODEL
# =====================================================

def save_model(rules):

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(rules, f)

    print(
        f"[REC] Model saved → {MODEL_PATH}"
    )

# =====================================================
# RECOMMENDATION FUNCTION
# =====================================================

def recommend(
    product_name,
    rules=None,
    top_n=5
):

    if rules is None:

        with open(MODEL_PATH, "rb") as f:
            rules = pickle.load(f)

    product_name = (
        product_name
        .strip()
        .upper()
    )

    matched = rules[
        rules["antecedents"]
        .str.contains(
            product_name,
            regex=False
        )
    ]

    matched = (
        matched
        .sort_values("lift", ascending=False)
        .head(top_n)
    )

    if matched.empty:

        return [
            {
                "product": "No recommendation found",
                "confidence": 0,
                "lift": 0
            }
        ]

    return [
        {
            "product": row["consequents"],
            "confidence": round(
                row["confidence"], 3
            ),
            "lift": round(
                row["lift"], 3
            ),
            "support": round(
                row["support"], 4
            )
        }
        for _, row in matched.iterrows()
    ]

# =====================================================
# MAIN
# =====================================================

def run():

    print("\n" + "=" * 52)
    print("   MODULE 3 — PRODUCT RECOMMENDATION (Apriori)")
    print("=" * 52)

    baskets, df = load_transactions()

    rules = build_rules(
        baskets,
        min_support=0.02,
        min_confidence=0.30,
        min_lift=1.50
    )

    RULES_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    rules.to_csv(
        RULES_FILE,
        index=False
    )

    save_model(rules)

    print(
        f"[REC] Rules saved → {RULES_FILE}"
    )

    sample_product = (
        df["Description"]
        .value_counts()
        .index[5]
    )

    print(
        f"\n[REC] Demo Product: "
        f"{sample_product}"
    )

    recommendations = recommend(
        sample_product,
        rules
    )

    for rec in recommendations:

        print(
            f"      → {rec['product']} "
            f"(conf={rec['confidence']}, "
            f"lift={rec['lift']})"
        )

    return rules

# =====================================================

if __name__ == "__main__":
    run()