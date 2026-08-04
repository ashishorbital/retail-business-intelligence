import { useState, useEffect } from "react";
import { Search, ShoppingBasket, Link } from "lucide-react";
import api from "../api";
import "../styles/dashboard.css";

export default function Recommendations() {

    const [product, setProduct] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        api.get("/products")
            .then((res) => setProducts(res.data))
            .catch((err) => console.error("Failed to load products", err));
    }, []);

    const handleSearchInput = (value) => {
        setProduct(value);
        if (!value.trim()) {
            setFilteredProducts([]);
            setShowDropdown(false);
            return;
        }
        const matches = products
            .filter((p) => p.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 8);
        setFilteredProducts(matches);
        setShowDropdown(true);
    };

    const selectProduct = (item) => {
        setProduct(item);
        setShowDropdown(false);
    };

    const searchRecommendations = async () => {
        if (!product.trim()) return;
        try {
            const res = await api.get(`/recommendations/${encodeURIComponent(product)}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            alert("No recommendations found");
            setResults([]);
        }
    };

    return (
        <div className="recommendation-page">

            <div className="page-header animate-fade-up">
                <p className="eyebrow">Basket Intelligence</p>
                <h1>Product Recommendations</h1>
                <p className="hero-copy">
                    Discover products frequently purchased together using association
                    rule mining — powered by your real transaction history.
                </p>
            </div>

            {/* Search */}
            <div className="search-panel animate-fade-up delay-1">
                <div className="product-search">
                    <div style={{ position: "relative" }}>
                        <Search
                            size={15}
                            style={{
                                position: "absolute", left: "14px",
                                top: "50%", transform: "translateY(-50%)",
                                color: "var(--text-muted)", pointerEvents: "none",
                                zIndex: 1
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search a product..."
                            value={product}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            style={{ paddingLeft: "40px" }}
                        />
                    </div>

                    {showDropdown && filteredProducts.length > 0 && (
                        <div className="search-dropdown">
                            {filteredProducts.map((item) => (
                                <div
                                    key={item}
                                    className="search-option"
                                    onClick={() => selectProduct(item)}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={searchRecommendations}>
                    Find Recommendations
                </button>
            </div>

            {/* Empty state */}
            {results.length === 0 && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px 20px",
                    color: "var(--text-muted)",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: "18px",
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "20px"
                    }}>
                        <ShoppingBasket size={28} color="var(--text-disabled)" />
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                        No product selected
                    </p>
                    <p style={{ fontSize: "13px" }}>
                        Search for a product above to discover frequently bought together items.
                    </p>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="recommendation-grid animate-fade-up">
                    {results.map((item, index) => (
                        <div key={index} className="recommendation-card section-card">

                            <div className="recommendation-header">
                                <div className="recommendation-rank">
                                    #{index + 1}
                                </div>
                                <div>
                                    <h3>{item.product}</h3>
                                    <p>
                                        <Link size={11} style={{ display: "inline", marginRight: 4 }} />
                                        Frequently purchased together
                                    </p>
                                </div>
                            </div>

                            <div className="recommendation-stats">
                                <div>
                                    <span>Confidence</span>
                                    <strong>{(item.confidence * 100).toFixed(1)}%</strong>
                                </div>
                                <div>
                                    <span>Lift</span>
                                    <strong>{item.lift}</strong>
                                </div>
                                <div>
                                    <span>Support</span>
                                    <strong>
                                        {item.support
                                            ? `${(item.support * 100).toFixed(2)}%`
                                            : "N/A"}
                                    </strong>
                                </div>
                            </div>

                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Confidence level</span>
                                    <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>
                                        {(item.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="confidence-bar">
                                    <div
                                        className="confidence-fill"
                                        style={{ width: `${item.confidence * 100}%` }}
                                    />
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}