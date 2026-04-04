// CameraPage.jsx
// React component for camera (photo + video segments) similar to TikTok
// Place this file in src/pages/CameraPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MODES = [
  { label: "Ảnh", value: "photo", duration: 0 },
  { label: "3s", value: 3, duration: 3 },
  { label: "15s", value: 15, duration: 15 },
  { label: "30s", value: 30, duration: 30 },
  { label: "60s", value: 60, duration: 60 },
];

export default function CameraPage() {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");
  const [modeIndex, setModeIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [segments, setSegments] = useState([]); // array of Blob
  const [segmentDurations, setSegmentDurations] = useState([]);
  const [currentSegmentStart, setCurrentSegmentStart] = useState(null);
  const [elapsed, setElapsed] = useState(0); // total seconds recorded
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const progressRequestRef = useRef(null);

  const selectedMode = MODES[modeIndex];
  const maxDuration = typeof selectedMode.value === "number" ? selectedMode.value : 0;

  useEffect(() => {
    startCamera();
    return () => {
      stopCameraStream();
      cancelAnimationFrame(progressRequestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    // auto-stop when reached max duration for video modes
    if (maxDuration > 0 && elapsed >= maxDuration && segments.length > 0) {
      // finalize and go to upload detail
      finalizeRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, maxDuration]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Không thể truy cập camera:", err);
      alert("Không thể truy cập camera. Vui lòng cho phép quyền hoặc thử lại.");
    }
  };

  const stopCameraStream = () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    } catch (e) {
      console.warn("stopCameraStream error", e);
    }
  };

  // Start a new MediaRecorder and collect chunks
  const startRecorder = () => {
    if (!mediaStreamRef.current) return;
    const options = { mimeType: "video/webm;codecs=vp8,opus" };
    let recorder;
    try {
      recorder = new MediaRecorder(mediaStreamRef.current, options);
    } catch (e) {
      // fallback without options
      recorder = new MediaRecorder(mediaStreamRef.current);
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setSegments((s) => [...s, blob]);
      // compute duration approximate via duration of segment recorded
      const segDuration = (Date.now() - currentSegmentStart) / 1000;
      setSegmentDurations((d) => [...d, segDuration]);
      setCurrentSegmentStart(null);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setCurrentSegmentStart(Date.now());
  };

  const stopRecorder = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    } catch (e) {
      console.warn("stopRecorder error", e);
    }
  };

  const handleCenterButton = () => {
    if (selectedMode.value === "photo") {
      takePhotoAndNavigate();
      return;
    }

    // video mode
    if (!recording) {
      // start
      setRecording(true);
      startRecorder();
      startProgressLoop();
    } else {
      // pause (stop current segment)
      stopRecorder();
      setRecording(false);
      cancelAnimationFrame(progressRequestRef.current);
    }
  };

  const startProgressLoop = () => {
    const tick = () => {
      if (currentSegmentStart) {
        const segmentElapsed = (Date.now() - currentSegmentStart) / 1000;
        const total = segmentDurations.reduce((a, b) => a + b, 0) + segmentElapsed;
        setElapsed(total);
      }
      progressRequestRef.current = requestAnimationFrame(tick);
    };
    progressRequestRef.current = requestAnimationFrame(tick);
  };

  const takePhotoAndNavigate = async () => {
    setIsProcessing(true);
    try {
      const video = videoRef.current;
      if (!video) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      // Flip horizontally if using user-facing camera
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setIsProcessing(false);
        navigate("/upload-detail", { state: { type: "photo", blob } });
      }, "image/jpeg", 0.92);
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      alert("Chụp ảnh thất bại");
    }
  };

  const discardLastSegment = () => {
    if (segments.length === 0) return;
    setSegments((s) => s.slice(0, -1));
    setSegmentDurations((d) => d.slice(0, -1));
    // recalc elapsed
    const total = segmentDurations.slice(0, -1).reduce((a, b) => a + b, 0);
    setElapsed(total);
  };

  const finalizeRecording = async () => {
    // ensure recorder stopped
    setIsProcessing(true);
    stopRecorder();
    // Wait microtask to ensure onstop fired and segments updated
    setTimeout(() => {
      const allBlobs = segments.slice();
      // if currently recording and currentSegmentStart exists, it will have been stopped already
      if (allBlobs.length === 0) {
        setIsProcessing(false);
        alert("Không có đoạn video nào để tiếp tục.");
        return;
      }
      const finalBlob = new Blob(allBlobs, { type: "video/webm" });
      setIsProcessing(false);
      navigate("/upload-detail", { state: { type: "video", blob: finalBlob } });
    }, 200);
  };

  const handleConfirm = () => {
    finalizeRecording();
  };

  const handleCancel = () => {
    // delete all segments
    setSegments([]);
    setSegmentDurations([]);
    setElapsed(0);
    setRecording(false);
    stopRecorder();
  };

  const toggleFacing = () => {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
    // restarting camera will be handled by useEffect
  };

  const formatTime = (t) => {
    if (!t && t !== 0) return "0:00";
    const s = Math.floor(t);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  // Circular progress percent
  const progressPercent = maxDuration > 0 ? Math.min(1, elapsed / maxDuration) : 0;

  return (
    <div className="w-full h-screen bg-black flex flex-col items-stretch">
      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          <div className="text-white">&nbsp;</div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="bg-black/40 text-white rounded-full p-2"
            >
              Đóng
            </button>
            <button
              onClick={toggleFacing}
              className="bg-black/40 text-white rounded-full p-2"
            >
              Đổi camera
            </button>
          </div>
        </div>

        {/* Floating header buttons like + kept out of here; we navigated from them */}

        {/* Bottom controls */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4">
          {/* Mode selector */}
          <div className="flex gap-3 bg-black/30 rounded-full px-3 py-2">
            {MODES.map((m, i) => (
              <button
                key={m.label}
                onClick={() => setModeIndex(i)}
                className={`text-white px-2 py-1 rounded-full ${i === modeIndex ? "bg-white/20" : ""}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Center record area */}
          <div className="flex items-center flex-col">
            {/* Progress circle + center button */}
            <div className="relative flex items-center justify-center">
              {/* Circular progress (SVG) */}
              <svg width="112" height="112" className="absolute">
                <circle cx="56" cy="56" r="50" strokeWidth="6" strokeOpacity="0.15" fill="none" />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={(1 - progressPercent) * 2 * Math.PI * 50}
                  strokeLinecap="round"
                  transform="rotate(-90 56 56)"
                />
              </svg>

              {/* center button */}
              <button
                onClick={handleCenterButton}
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  recording ? "bg-white/10" : "bg-white"
                }`}
                aria-label="record"
              >
                {/* inner circle */}
                <div className={`w-16 h-16 rounded-full ${recording ? "bg-red-600" : "bg-white"}`}></div>
              </button>
            </div>

            {/* small controls under center button */}
            <div className="flex items-center gap-4 mt-2 text-white">
              <div>{maxDuration > 0 ? `${formatTime(elapsed)} / ${formatTime(maxDuration)}` : "Ảnh"}</div>
              {recording ? (
                <button
                  onClick={() => {
                    // stop segment (pause)
                    handleCenterButton();
                  }}
                  className="px-3 py-1 bg-black/40 rounded"
                >
                  Tạm dừng
                </button>
              ) : null}
              <button onClick={discardLastSegment} className="px-3 py-1 bg-black/40 rounded">
                ❌
              </button>
              <button onClick={handleConfirm} className="px-3 py-1 bg-black/40 rounded">
                ✅
              </button>
            </div>
          </div>
        </div>

        {/* small indicator of segments */}
        <div className="absolute top-20 left-4 text-white">
          {segments.length > 0 && (
            <div className="bg-black/40 px-2 py-1 rounded">
              Đoạn: {segments.length} • Tổng: {formatTime(elapsed)}
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">Đang xử lý...</div>
        )}
      </div>
    </div>
  );
}


// UploadDetailPage.jsx
// Place this file in src/pages/UploadDetailPage.jsx

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function UploadDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const [previewUrl, setPreviewUrl] = useState(null);
  const [desc, setDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!state || !state.type) {
      // nothing to show
      navigate(-1);
      return;
    }

    const blob = state.blob;
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleUpload = async () => {
    if (!state || !state.blob) return;
    setUploading(true);
    try {
      const form = new FormData();
      if (state.type === "photo") {
        form.append("type", "photo");
        form.append("image", state.blob, "photo.jpg");
      } else {
        form.append("type", "video");
        form.append("video", state.blob, "video.webm");
      }
      form.append("description", desc);

      // Adjust endpoint if needed
      const res = await fetch("/api/video/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload thất bại");
      }
      const data = await res.json();
      alert("Tải lên thành công!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Upload thất bại: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Xác nhận & tải lên</h2>
          <button onClick={() => navigate(-1)} className="bg-white/10 px-3 py-1 rounded">Quay lại</button>
        </div>

        <div className="bg-black p-4 rounded">
          {state?.type === "photo" ? (
            <img src={previewUrl} alt="preview" className="w-full h-auto rounded" />
          ) : (
            <video ref={videoRef} src={previewUrl} controls className="w-full h-auto rounded" />
          )}
        </div>

        <div className="mt-4">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Viết mô tả..."
            className="w-full p-3 rounded bg-gray-800"
            rows={4}
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 px-4 py-2 rounded">
            {uploading ? "Đang tải..." : "Đăng"}
          </button>
          <button onClick={() => navigate(-1)} className="bg-white/10 px-4 py-2 rounded">Hủy</button>
        </div>
      </div>
    </div>
  );
}


// USAGE NOTES (copy to your project README or integrate manually):
// 1) Put CameraPage.jsx and UploadDetailPage.jsx into src/pages/
// 2) Add routes in your AppRouter.jsx or wherever you handle routes:
//     <Route path="/camera" element={<CameraPage/>} />
//     <Route path="/upload-detail" element={<UploadDetailPage/>} />
// 3) In your FloatingHeaderButtons component, navigate to /camera when user clicks +
// 4) Backend endpoint: this UploadDetailPage expects POST /api/video/upload to accept multipart/form-data
//    with keys: video (file) or image (file), description (text), and type (photo|video)
// 5) Browser compatibility: code uses MediaRecorder and MediaDevices API. On some browsers (older or certain forks)
//    MediaRecorder mime types may vary. You may need to transcode on server or use a polyfill.
// 6) Performance: the recorder stores segments as Blobs. For long high-res videos you may hit memory limits.
//    Consider streaming/upload or chunked upload on a production app.

// END OF FILE
