import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./AdvertisingSection.css";

const AdvertisingSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/advideos");
        setVideos(res.data.videos || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load advertising videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <p>Loading advertisements...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="advertising-section">
      <h2>📢 Featured Advertisements</h2>

      {videos.length === 0 ? (
        <p>No advertisements available.</p>
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
                  allowFullScreen
                />
              ) : (
                <p>TikTok videos not supported yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdvertisingSection;