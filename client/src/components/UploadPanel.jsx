import { useRef, useState } from "react";

export default function UploadPanel() {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);

  const API = "https://florascan-ai-powered-plant-analysis-tool.onrender.com";

  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("Upload or capture an image to begin.");
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  /* =========================
     FILE HANDLER (COMMON)
  ========================= */
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setShowCamera(false);
    setShowDownload(false);
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

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    setResult("Analyzing plant...");
    setShowDownload(false);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      setResult(data.result);
      setImageData(data.image);
      setShowDownload(true);
    } catch {
      setResult("❌ Failed to analyze plant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DOWNLOAD PDF
  ========================= */
  const downloadPDF = async () => {
    try {
      const res = await fetch(`${API}/download`, {
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
    <section className="app">
      <div className="grid">
        {/* LEFT PANEL */}
        <div className="panel">
          <h2>Upload or Capture</h2>

          <div
            className="upload-box"
            onClick={() => setShowOptions(true)}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <p>Upload plant image</p>
          </div>

          {showOptions && (
            <div className="upload-options">
              <button
                className="secondary"
                onClick={() => {
                  galleryRef.current.click();
                  setShowOptions(false);
                }}
              >
                <i className="fa-solid fa-folder-open"></i> Choose from Device
              </button>

              <button
                className="secondary"
                onClick={() => {
                  openCamera();
                  setShowOptions(false);
                }}
              >
                <i className="fa-solid fa-camera"></i> Open Camera
              </button>
            </div>
          )}

          {/* GALLERY INPUT */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />

          {/* CAMERA INPUT (MOBILE ONLY) */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleUpload}
          />

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

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", marginTop: "15px" }}
            />
          )}

          <button onClick={analyzePlant} disabled={loading}>
            <i className="fa-solid fa-brain"></i> Analyze Plant
          </button>

          {loading && <div id="loading">Analyzing...</div>}
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          <h2>Analysis Result</h2>
          <div id="result">{result}</div>

          {showDownload && (
            <button className="danger" onClick={downloadPDF}>
              <i className="fa-solid fa-file-pdf"></i> Download PDF
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
