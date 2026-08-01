# RetailIQ: AI-Driven Retail Decision Intelligence Platform

## 🎯 High-Level Idea
**RetailIQ** is an end-to-end AI-driven Decision Intelligence Platform designed for retail businesses. Instead of just showing historical charts, it uses machine learning to actively predict the future and prescribe actions. 
The platform allows business owners to:
- Predict how much revenue they will make in the next 30 days.
- Identify who their most valuable (VIP) customers are and predict their Customer Lifetime Value (CLV).
- Discover hidden purchasing patterns (which products are bought together).
- Use a ChatGPT-like natural language interface to ask direct questions about their sales data.

---

## 🔄 Detailed Workflow (Data Pipeline)
Here is the step-by-step flow of what happens when data enters the system:

1. **Data Ingestion (`DataUpload.jsx` ➔ Backend Pipeline):** 
   - The user uploads raw transaction data (e.g., an Excel/CSV file with columns like `InvoiceNo`, `CustomerID`, `Quantity`, `UnitPrice`, `InvoiceDate`).
2. **Data Preprocessing & Feature Engineering:**
   - The backend cleans the data (removes missing IDs, filters out negative quantities/prices).
   - It aggregates the raw transactions into **Customer Profiles** (calculating Recency, Frequency, Monetary value) and **Time-Series Data** (daily revenue aggregates).
3. **Model Retraining:**
   - The data pipeline automatically triggers the retraining of 4 distinct Machine Learning modules using the fresh data.
   - It also updates the AI Vector Database so the "Ask AI" feature has the latest context.
4. **API Serving (FastAPI):**
   - The trained models are saved as `.pkl` files. 
   - The FastAPI backend exposes endpoints (e.g., `/forecast`, `/clv/{id}`) that the frontend React application calls to display the interactive dashboards.

---

## 🧠 Backend Models & Algorithms

The backend utilizes four distinct machine learning modules, each serving a specific business purpose.

### 1. Customer Segmentation Module (`segmentation.py`)
* **Algorithm used:** **K-Means Clustering** (Unsupervised Learning)
* **What it does with incoming data:**
  - It extracts three key RFM (Recency, Frequency, Monetary) features per customer: `days_since_last_purchase`, `purchase_frequency`, and `total_revenue`.
  - It scales this data using `StandardScaler` so that large revenue numbers don't overpower the model.
  - The K-Means algorithm groups the customers into **3 distinct clusters** based on their behavioral similarity.
  - The clusters are automatically mapped to business tiers based on average revenue: **VIP Customer**, **Regular Customer**, and **Low Value Customer**.

### 2. Customer Lifetime Value (CLV) Prediction (`clv.py`)
* **Algorithm used:** **Random Forest Regressor** (Supervised Learning)
* **What it does with incoming data:**
  - It uses historical customer behavioral features: `purchase_frequency`, `total_quantity`, `unique_products`, `days_since_last_purchase`, `customer_lifespan_days`, and `avg_order_value`.
  - The Random Forest model learns the complex, non-linear relationships between a customer's engagement metrics and the actual `total_revenue` they generate.
  - When a user looks up a Customer ID on the frontend, the model predicts their future monetary value, allowing the business to decide how much to spend on retaining that specific customer.

### 3. Product Recommendation Engine (`recommendation.py`)
* **Algorithm used:** **Apriori Algorithm** (Association Rule Mining)
* **What it does with incoming data:**
  - It groups all raw transaction items by `InvoiceNo` to create "shopping baskets".
  - The Apriori algorithm scans these baskets to find frequent item combinations (e.g., people who buy "Coffee" also buy "Sugar").
  - It generates mathematical rules based on:
    - **Support:** How often the items are bought together.
    - **Confidence:** How likely item B is bought when item A is bought.
    - **Lift:** The strength of the association compared to random chance.
  - The frontend uses this to show "Frequently bought together" suggestions.

### 4. Sales Forecasting (`forecasting.py`)
* **Algorithm used:** **Random Forest Regressor** (adapted for Time-Series forecasting)
* **What it does with incoming data:**
  - It aggregates all raw transactions into total daily revenue.
  - It performs complex feature engineering to give the model a sense of time. It creates **Lag features** (revenue 1, 7, 14, 30 days ago), **Rolling averages** (average revenue over the last 7, 14, 30 days), and **Calendar features** (day of week, month, is_weekend).
  - The model trains on these historical time-steps.
  - To predict the future 30 days, it predicts tomorrow's revenue, appends that prediction to the dataset, recalculates the rolling averages and lags, and uses that to predict the day after tomorrow (autoregressive forecasting).
