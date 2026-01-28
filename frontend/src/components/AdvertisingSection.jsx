// src/components/AdvertisingSection.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdvertisingSection.css";

const AdvertisingSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/advideos");
        setVideos(res.data.videos || []); // ✅ Make sure it's an array
      } catch (err) {
        console.error("Failed to fetch videos", err);
        setError("Failed to load advertising videos.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <p className="ad-loading">Loading advertisements...</p>;
  if (error) return <p className="ad-error">{error}</p>;

  return (
    <section className="advertising-section">
      <h2 className="ad-title">📢 Featured Advertisements</h2>
      <p className="ad-subtitle">
        Explore businesses promoting their services and special offers.
      </p>

      {videos.length === 0 ? (
        <p className="no-videos">No advertisements available at the moment.</p>
      ) : (
        <div className="ad-video-grid">
          {videos.map((video) => (
            <div key={video._id} className="ad-card">
              <h3>{video.title}</h3>
              {video.platform === "youtube" ? (
                <iframe
                  src={video.videoUrl
                    .replace("/watch?v=", "/embed/")
                    .replace("youtu.be/", "youtube.com/embed/")}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="ad-video-iframe"
                />
              ) : (
                <p className="tiktok-placeholder">TikTok videos not supported yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdvertisingSection;
