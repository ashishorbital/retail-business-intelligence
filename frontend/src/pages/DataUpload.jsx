import { useState, useEffect, useRef } from "react";
import api from "../api";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, FileText, X } from "lucide-react";

export default function DataUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        let interval;
        if (status?.is_running || uploading) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get("/api/pipeline-status");
                    setStatus(res.data);
                    if (uploading && res.data.is_running) {
                        setUploading(false);
                    }
                } catch (err) {
                    console.error("Error fetching pipeline status", err);
                }
            }, 2000);
        } else {
            api.get("/api/pipeline-status").then(res => {
                if (res.data.is_running) setStatus(res.data);
            });
        }
        return () => clearInterval(interval);
    }, [status?.is_running, uploading]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append("file", file);
        try {
            await api.post("/api/upload-data", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
        } catch (err) {
            setError(err.response?.data?.detail || "Upload failed. Please try again.");
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px" }}>

            <div className="page-header animate-fade-up">
                <p className="eyebrow">Data Management</p>
                <h1>Data Center</h1>
                <p className="hero-copy">
                    Upload new transaction data to automatically retrain the ML
                    forecasting models and refresh the AI vector database.
                </p>
            </div>

            <div className="section-card animate-fade-up delay-1">

                {/* Pipeline running */}
                {status?.is_running ? (
                    <div style={{ padding: "20px 0", textAlign: "center" }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: "18px",
                            background: "var(--accent-subtle)",
                            border: "1px solid rgba(0,208,156,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 20px",
                        }}>
                            <RefreshCw
                                size={28} color="var(--accent)"
                                style={{ animation: "spin 1.5s linear infinite" }}
                            />
                        </div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
                            Processing Data
                        </h3>
                        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "28px" }}>
                            {status.status}
                        </p>

                        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Progress</span>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>{status.progress}%</span>
                            </div>
                            <div style={{ height: "6px", background: "var(--bg-surface)", borderRadius: "999px", overflow: "hidden" }}>
                                <div style={{
                                    height: "100%",
                                    width: `${status.progress}%`,
                                    background: "linear-gradient(90deg, var(--accent-from), var(--accent-to))",
                                    borderRadius: "999px",
                                    transition: "width 0.5s ease"
                                }} />
                            </div>
                        </div>
                    </div>

                ) : status?.progress === 100 && !error ? (
                    /* Success state */
                    <div style={{ padding: "20px 0", textAlign: "center" }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: "18px",
                            background: "var(--success-bg)",
                            border: "1px solid rgba(16,185,129,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 20px",
                        }}>
                            <CheckCircle size={30} color="var(--success)" />
                        </div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
                            Pipeline Complete!
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "28px" }}>
                            Your models have been successfully retrained with the new data.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "12px 28px",
                                background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                                color: "white", border: "none",
                                borderRadius: "10px", fontWeight: 600,
                                fontSize: "14px", cursor: "pointer",
                                fontFamily: "var(--font-body)"
                            }}
                        >
                            Refresh Dashboard
                        </button>
                    </div>

                ) : (
                    /* Upload form */
                    <div>
                        {/* Dropzone */}
                        <div
                            className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.csv"
                                style={{ display: "none" }}
                                onChange={handleChange}
                            />

                            <UploadCloud size={40} />
                            <h3>Drag & drop your dataset</h3>
                            <p>Supports .xlsx and .csv formats · Click to browse</p>

                            {file && (
                                <div className="file-chip" onClick={(e) => e.stopPropagation()}>
                                    <FileText size={14} color="var(--accent)" />
                                    <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{file.name}</span>
                                    <span style={{ color: "var(--text-muted)" }}>
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        style={{
                                            background: "none", border: "none",
                                            cursor: "pointer", color: "var(--text-muted)",
                                            display: "flex", alignItems: "center", padding: 0
                                        }}
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="error-card" style={{ marginTop: "14px" }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Upload button */}
                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                style={{
                                    padding: "12px 28px",
                                    background: !file || uploading
                                        ? "var(--bg-surface)"
                                        : "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                                    color: !file || uploading ? "var(--text-muted)" : "white",
                                    border: "1px solid var(--border)",
                                    borderRadius: "10px",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    cursor: !file || uploading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    fontFamily: "var(--font-body)"
                                }}
                            >
                                {uploading ? "Uploading…" : "Start Auto-Training"}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Info cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "20px" }} className="animate-fade-up delay-2">
                {[
                    { title: "CLV Model",    desc: "Retrained with gradient boosting on new transaction data.",     color: "#00d09c" },
                    { title: "AI Database",  desc: "Vector index rebuilt with latest customer & segment records.",   color: "#121212" },
                    { title: "Forecasting",  desc: "Prophet model updated with new time-series data.",              color: "#f5a623" },
                ].map((info) => (
                    <div key={info.title} className="section-card" style={{ padding: "18px 20px" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: info.color, marginBottom: "10px" }} />
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", fontFamily: "var(--font-display)" }}>
                            {info.title}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                            {info.desc}
                        </p>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </div>
    );
}
