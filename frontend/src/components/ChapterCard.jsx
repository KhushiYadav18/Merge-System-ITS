export default function ChapterCard({ chapter, onOpen }) {
  return (
    <article className="card chapter-card">
      <div>
        <p className="muted">{chapter.chapter_id}</p>
        <h3>{chapter.chapter_name}</h3>
      </div>
      <p>
        Difficulty: <strong>{chapter.chapter_difficulty}</strong>
      </p>
      <p>Expected time: {chapter.expected_completion_time_seconds}s</p>
      <button
        type="button"
        className="primary-btn"
        onClick={() => onOpen(chapter)}
      >
        Open Simulator
      </button>
    </article>
  );
}
