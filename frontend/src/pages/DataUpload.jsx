import { useState, useEffect, useRef } from "react";
import api from "../api";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function DataUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // the pipeline status object
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Poll status when pipeline is running
    useEffect(() => {
        let interval;
        if (status?.is_running || uploading) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get("/api/pipeline-status");
                    setStatus(res.data);
                    if (uploading && res.data.is_running) {
                        setUploading(false); // Switch from uploading to pipeline progress
                    }
                } catch (err) {
                    console.error("Error fetching pipeline status", err);
                }
            }, 2000);
        } else {
            // Check status on mount just in case it's already running
            api.get("/api/pipeline-status").then(res => {
                if (res.data.is_running) setStatus(res.data);
            });
        }
        return () => clearInterval(interval);
    }, [status?.is_running, uploading]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
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
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Status effect will pick up the running state
        } catch (err) {
            setError(err.response?.data?.detail || "Upload failed. Please try again.");
            setUploading(false);
        }
    };

    return (
        <div>
            <header className="hero animate-fade-up">
                <p className="type-1" style={{textTransform: 'uppercase'}}>Data Management</p>
                <h2 className="type-4">Data Center</h2>
                <p className="type-2" style={{maxWidth: '600px'}}>Upload new transaction data to automatically retrain the ML forecasting models and AI vector database.</p>
            </header>

            <div className="section-card animate-fade-up delay-1" style={{maxWidth: '800px'}}>
                
                {status?.is_running ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <RefreshCw size={48} color="var(--text-main)" className="loading-pulse" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
                        <h3 className="type-4" style={{ marginBottom: '0.5rem' }}>Processing Data</h3>
                        <p className="type-1" style={{ color: 'var(--text-muted)' }}>{status.status}</p>
                        
                        <div style={{ marginTop: '2rem', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${status.progress}%`, background: 'var(--text-main)', transition: 'width 0.5s ease' }}></div>
                        </div>
                        <p className="type-1" style={{ marginTop: '0.5rem', textAlign: 'right' }}>{status.progress}%</p>
                    </div>
                ) : status?.progress === 100 && !error ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <CheckCircle size={48} color="green" style={{ marginBottom: '1rem' }} />
                        <h3 className="type-4">Pipeline Complete!</h3>
                        <p className="type-2" style={{ marginBottom: '2rem' }}>Your models have been successfully retrained.</p>
                        <button className="chat-btn" onClick={() => window.location.reload()} style={{ padding: '0.8rem 2rem' }}>
                            Refresh Dashboard
                        </button>
                    </div>
                ) : (
                    <div>
                        <div 
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${dragActive ? 'var(--text-main)' : 'var(--border)'}`,
                                background: dragActive ? 'var(--accent-light)' : 'transparent',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".xlsx,.csv" 
                                style={{ display: 'none' }} 
                                onChange={handleChange}
                            />
                            
                            <UploadCloud size={48} color={dragActive ? 'var(--text-main)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
                            <h3 className="type-4">Drag and drop your dataset</h3>
                            <p className="type-1" style={{ color: 'var(--text-muted)' }}>or click to browse (.xlsx or .csv)</p>
                            
                            {file && (
                                <div style={{ marginTop: '2rem', display: 'inline-block', background: 'var(--bg-app)', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}>
                                    <span className="type-1">{file.name}</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={18} />
                                <span className="type-1">{error}</span>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                className="chat-btn" 
                                onClick={handleUpload} 
                                disabled={!file || uploading}
                                style={{ padding: '0.8rem 2rem' }}
                            >
                                {uploading ? 'Uploading...' : 'Start Auto-Training'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
