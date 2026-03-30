import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchChapters } from "../api/api";
import ChapterCard from "../components/ChapterCard";
import MathFloatLayer from "../components/MathFloatLayer";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.detail || "Failed to load chapters.",
        );
      }
    };
    load();
  }, []);

  return (
    <main className="page">
      <MathFloatLayer density="low" />
      <header className="page-header">
        <div>
          <h1>Welcome, {user?.username}</h1>
          <p>Select a chapter to open the simulator.</p>
        </div>
        <button type="button" className="secondary-btn" onClick={logout}>
          Logout
        </button>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section className="grid">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.chapter_id}
            chapter={chapter}
            onOpen={() => navigate(`/simulator/${chapter.chapter_id}`)}
          />
        ))}
      </section>
    </main>
  );
}
