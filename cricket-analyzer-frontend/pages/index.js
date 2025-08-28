import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Home() {
  const [video1, setVideo1] = useState(null);
  const [video2, setVideo2] = useState(null);
  const [video1Preview, setVideo1Preview] = useState(null);
  const [video2Preview, setVideo2Preview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle manual uploads
  const handleUpload = (file, setVideo, setPreview) => {
    setVideo(file);
    setPreview(URL.createObjectURL(file));
  };

  // Preload Babar Azam cover drive sample
  const handleBabarSample = () => {
    const sampleUrl = "/samples/babar_cover_drive.mp4"; // put sample video in public/samples
    setVideo2Preview(sampleUrl);
    setVideo2("babar_sample"); // just a placeholder name for backend
  };

  const handleAnalyze = async () => {
    if (!video1 || !video2) {
      alert("Please upload both videos!");
      return;
    }

    const formData = new FormData();
    if (video1 !== "babar_sample") formData.append("video1", video1);
    if (video2 !== "babar_sample") formData.append("video2", video2);

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing videos");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      {/* Title */}
      <motion.h1
        className="text-4xl font-bold mb-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🏏 Cover Drive Analyzer
      </motion.h1>
      <p className="mb-6 text-gray-300 text-center max-w-xl">
        Upload your cricket cover drive video and compare it to a professional's technique like{" "}
        <span className="text-blue-400 font-semibold">Babar Azam</span>.
      </p>

      {/* Video upload section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Player 1 Upload */}
        <UploadCard
          title="Your Cover Drive"
          preview={video1Preview}
          onFileSelect={(e) => handleUpload(e.target.files[0], setVideo1, setVideo1Preview)}
        />

        {/* Player 2 Upload */}
        <UploadCard
          title="Opponent / Babar Azam"
          preview={video2Preview}
          onFileSelect={(e) => handleUpload(e.target.files[0], setVideo2, setVideo2Preview)}
        >
          <button
            onClick={handleBabarSample}
            className="mt-3 px-4 py-2 bg-yellow-500 rounded-lg text-black font-semibold hover:bg-yellow-400 transition"
          >
            Use Babar Azam Sample
          </button>
        </UploadCard>
      </div>

      {/* Analyze button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-blue-600 rounded-xl font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Videos"}
      </motion.button>

      {/* Results */}
      {result && (
        <motion.div
          className="mt-8 p-6 bg-gray-800 rounded-xl shadow-lg w-full max-w-xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl mb-4 font-semibold">Results</h2>
          <ScoreBar label="Video 1" score={result.video1_score} />
          <ScoreBar label="Video 2" score={result.video2_score} />
          <p className="text-yellow-400 mt-4 text-xl">
            🏆 Winner: <b>{result.winner}</b>
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* Upload Card Component */
const UploadCard = ({ title, preview, onFileSelect, children }) => (
  <motion.div
    className="bg-gray-800 rounded-xl p-4 shadow-lg flex flex-col items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 transition px-4 py-2 rounded-lg">
      Select Video
      <input type="file" accept="video/*" className="hidden" onChange={onFileSelect} />
    </label>
    {preview && (
      <video src={preview} controls className="rounded-lg w-full mt-3 shadow" />
    )}
    {children}
  </motion.div>
);

/* Score Bar Component */
const ScoreBar = ({ label, score }) => (
  <div className="mb-3">
    <p className="mb-1">{label}: <b>{score}</b>/100</p>
    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  </div>
);
