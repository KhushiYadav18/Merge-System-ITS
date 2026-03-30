import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MathFloatLayer from "../components/MathFloatLayer";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    student_id: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isRegister) {
        await register(formState);
      } else {
        await login({
          username: formState.username,
          password: formState.password,
        });
      }
      navigate("/dashboard");
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;
      const errors = requestError?.response?.data?.errors;
      setError(
        detail ||
          (Array.isArray(errors)
            ? errors.join(", ")
            : "Authentication failed."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <MathFloatLayer density="high" />
      <section className="card auth-card">
        <h1>Adaptive Recommendation System</h1>
        <p>Grade 6-8 Mathematics Learning Platform</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Username</span>
            <input
              name="username"
              value={formState.username}
              onChange={handleChange}
              required
            />
          </label>

          {isRegister && (
            <>
              <label>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>Student ID (optional)</span>
                <input
                  name="student_id"
                  value={formState.student_id}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formState.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting
              ? "Processing..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="text-btn"
          onClick={() => setIsRegister((prev) => !prev)}
        >
          {isRegister ? "Have an account? Login" : "New user? Register"}
        </button>
      </section>
    </main>
  );
}
