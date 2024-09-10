import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [predictedAge, setPredictedAge] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setPredictedAge(null);
    setError(null);

    try {
      const response = await axios.post('https://age-api.onrender.com/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPredictedAge(response.data.predicted_age);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 p-6 text-white">
      {/* Larger Age Prediction Title */}
      <h1 className="text-5xl font-bold mb-4 text-center">Age Prediction</h1>

      <p className="mt-0 text-xl italic text-sky-600 text-center mb-10">
        Snap, upload, and watch as we reveal your age in an instant!
      </p>

      {/* File input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 block w-full max-w-xs text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
      />

      {/* Predict button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full max-w-xs bg-cyan-800 text-white mb-4 py-2 rounded-md hover:bg-cyan-900 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Predicting...' : 'Predict Age'}
      </button>

      {/* Placeholder to avoid shifting */}
      <div className="min-h-[80px] mt-4 text-center">
        {/* Show predicted age */}
        {predictedAge !== null && !loading && (
          <p className="text-2xl font-bold mb-4">Predicted Age: {Math.round(predictedAge)}</p>
        )}

        {/* Show error if any */}
        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* Spacer to keep the layout stable */}
      <div className="mt-16"></div>
    </div>
  );
}

export default App;
