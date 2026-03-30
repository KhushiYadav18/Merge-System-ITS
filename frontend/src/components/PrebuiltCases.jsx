import { PREBUILT_CASES } from "../utils/constants";

export default function PrebuiltCases({ onSelect }) {
  return (
    <section className="card">
      <h3>Prebuilt Edge Cases</h3>
      <div className="case-grid">
        {PREBUILT_CASES.map((item) => (
          <button
            key={item.key}
            type="button"
            className="case-item"
            onClick={() => onSelect(item)}
          >
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
