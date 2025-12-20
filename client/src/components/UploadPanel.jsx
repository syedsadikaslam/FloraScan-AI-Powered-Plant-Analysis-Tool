import { useRef, useState } from "react";

export default function UploadPanel() {
  const fileRef = useRef(null);
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
     FILE UPLOAD
  ========================= */
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setShowDownload(false);
    setShowCamera(false);
  };

  /* =========================
     OPEN CAMERA
  ========================= */
  const openCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    videoRef.current.srcObject = mediaStream;
    setStream(mediaStream);
    setShowCamera(true);
  };

  /* =========================
     CAPTURE PHOTO
  ========================= */
  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", {
        type: "image/jpeg",
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;

      setPreview(URL.createObjectURL(blob));
    });

    stream.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
  };

  /* =========================
     ANALYZE PLANT (FIXED)
  ========================= */
  const analyzePlant = async () => {
    if (!fileRef.current.files[0]) {
      alert("Please upload or capture an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileRef.current.files[0]);

    setLoading(true);
    setShowDownload(false);
    setResult("Analyzing plant...");

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      setResult(data.result);
      setImageData(data.image);
      setShowDownload(true);
    } catch (err) {
      console.error(err);
      setResult("❌ Failed to analyze plant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DOWNLOAD PDF (FIXED)
  ========================= */
  const downloadPDF = async () => {
    try {
      const res = await fetch(`${API}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result,
          image: imageData,
        }),
      });

      if (!res.ok) {
        throw new Error("PDF error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "FloraScan_Report.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
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
                  fileRef.current.click();
                  setShowOptions(false);
                }}
              >
                <i className="fa-solid fa-folder-open"></i> Choose from Drive
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

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />

          {showCamera && (
            <>
              <video
                ref={videoRef}
                autoPlay
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
              style={{ display: "block" }}
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
