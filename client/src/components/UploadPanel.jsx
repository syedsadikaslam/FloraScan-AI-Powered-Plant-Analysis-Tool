import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

export default function UploadPanel() {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);

  const API = "http://localhost:5000"; // Localhost for dev

  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [analysisId, setAnalysisId] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [debugLog, setDebugLog] = useState([]); // Debug state

  const addLog = (msg) => {
    setDebugLog((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
    console.log(msg);
  };

  /* =========================
     FILE HANDLER (COMMON)
  ========================= */
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setShowCamera(false);
    setResult("");
    setAnalysisId(null);
  };

  /* =========================
     OPEN CAMERA (DESKTOP + MOBILE)
  ========================= */
  const openCamera = async () => {
    // 📱 Mobile → native camera input
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      cameraRef.current.click();
      return;
    }

    // 💻 Desktop → webcam
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      alert("Camera permission denied");
    }
  };

  /* =========================
     CAPTURE PHOTO (DESKTOP)
  ========================= */
  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      galleryRef.current.files = dt.files;

      setPreview(URL.createObjectURL(blob));
    });

    stream.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
  };

  /* =========================
     ANALYZE PLANT
  ========================= */
  const analyzePlant = async () => {
    const file =
      galleryRef.current.files[0] || cameraRef.current.files[0];

    if (!file) {
      alert("Please upload or capture an image");
      return;
    }

    addLog("Starting analysis...");
    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    setResult("");
    setAnalysisId(null);

    try {
      addLog(`Sending request to ${API}/api/analysis/analyze`);

      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const res = await fetch(`${API}/api/analysis/analyze`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      addLog(`Response status: ${res.status}`);

      if (!res.ok) {
        let errorMessage = "Server error";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await res.text();
          errorMessage = `Non-JSON error: ${text.substring(0, 50)}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      addLog("Data received. Result length: " + (data.result ? data.result.length : 0));

      if (!data.result) {
        throw new Error("Received empty result from server");
      }

      setResult(data.result);
      setAnalysisId(data.id);
      setImageData(data.image);
    } catch (error) {
      addLog(`Error: ${error.message}`);
      setResult(`❌ Error: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
      addLog("Analysis finished");
    }
  };

  /* =========================
     TEST CONNECTION
  ========================= */
  const testConnection = async () => {
    try {
      addLog("Testing backend connection...");
      const res = await fetch(`${API}/api/analysis/test`);
      const data = await res.json();
      addLog(`Test Result: ${JSON.stringify(data)}`);
      alert(`Backend is connected! Message: ${data.message}`);
    } catch (error) {
      addLog(`Test Failed: ${error.message}`);
      alert("Backend connection failed!");
    }
  };

  /* =========================
     DOWNLOAD PDF
  ========================= */
  const downloadPDF = async () => {
    try {
      const res = await fetch(`${API}/api/analysis/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, image: imageData }),
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "FloraScan_Report.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch {
      alert("❌ Failed to download PDF");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <section className="upload-card-container">
      <div className="upload-card">
        {/* LEFT PANEL */}
        <div className="panel-content">

          <h2>Upload or Capture</h2>

          <div
            className="upload-box"
            onClick={() => setShowOptions(true)}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <p>Upload plant image</p>
          </div>

          {showOptions && (
            <div className="upload-options" style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button
                className="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  galleryRef.current.click();
                  setShowOptions(false);
                }}
              >
                <i className="fa-solid fa-folder-open"></i> Device
              </button>

              <button
                className="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  openCamera();
                  setShowOptions(false);
                }}
              >
                <i className="fa-solid fa-camera"></i> Camera
              </button>
            </div>
          )}

          {/* INPUTS */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleUpload}
          />

          {/* CAMERA VIEW */}
          {showCamera && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  marginTop: "15px",
                }}
              />
              <button onClick={capturePhoto}>Capture Photo</button>
            </>
          )}

          {/* PREVIEW */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="preview-img"
            />
          )}

          <button onClick={analyzePlant} disabled={loading || !preview}>
            <i className="fa-solid fa-brain"></i> {loading ? "Analyzing..." : "Analyze Plant"}
          </button>

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Analyzing plant features & checking health...</p>
            </div>
          )}

          {/* DEBUG LOG */}

        </div>

        {/* RIGHT PANEL (RESULT) */}
        {result ? (
          <div className="panel-content" style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <h2>Analysis Result</h2>

            <div className="result-content">

              <div className="markdown-result">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>

            <div className="actions">
              <button onClick={downloadPDF} className="secondary">
                <i className="fa-solid fa-file-pdf"></i> Download PDF
              </button>
              {analysisId && (
                <Link to={`/plant/${analysisId}`}>
                  <button className="secondary">
                    <i className="fa-solid fa-comments"></i> Chat with AI about this Plant
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="panel-content" style={{ marginTop: "40px", opacity: 0.6, textAlign: "center" }}>
            <p>Results will appear here after analysis.</p>
          </div>
        )}
      </div>
    </section>
  );
}
