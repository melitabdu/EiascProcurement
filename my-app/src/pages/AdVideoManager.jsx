// src/pages/AdminVideoManager.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api'; // ✅ Make sure this points to your axios instance
import { Trash2 } from 'lucide-react';

const AdminVideoManager = () => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Fetch existing videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('/advideos');
        setVideos(res.data.videos); // ✅ Only assign the actual array
      } catch (err) {
        setError('Failed to load videos');
      }
    };
    fetchVideos();
  }, []);

  // ✅ Handle submit
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/advideos', { title, platform, videoUrl });
      setVideos((prev) => [...prev, res.data]);
      setTitle('');
      setPlatform('youtube');
      setVideoUrl('');
      setError('');
    } catch (err) {
      setError('Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/advideos/${id}`);
      setVideos((prev) => prev.filter((video) => video._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete video');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Advertising Videos</h2>

      <form onSubmit={handleAddVideo} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Video Title"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="border p-2 rounded"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
        </select>
        <input
          type="url"
          placeholder="Video URL"
          className="border p-2 rounded"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 col-span-full"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Video'}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {videos.length === 0 ? (
          <p className="text-gray-600">No videos yet</p>
        ) : (
          videos.map((video) => (
            <div
              key={video._id}
              className="border p-4 rounded shadow-sm relative bg-white"
            >
              <h3 className="font-semibold mb-2">{video.title}</h3>
              {video.platform === 'youtube' ? (
                <iframe
                  className="w-full h-48"
                  src={video.videoUrl.replace('/watch?v=', '/embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={video.title}
                  allowFullScreen
                />
              ) : (
                <p className="text-sm text-gray-500">TikTok not embedded yet</p>
              )}
              <button
                onClick={() => handleDelete(video._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVideoManager;
