import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [roleType, setRoleType] = useState("candidate");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setRoleType(role);
    setForm({ ...form, roleType: role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("accounts")) || [];

    if (isLogin) {
      const user = users.find((u) => u.email === form.email);
      if (!user) return setError("Email not found");
      if (user.password !== form.password) return setError("Wrong password");
      localStorage.setItem("currentUser", JSON.stringify(user));
      if (user.role === "hr") navigate("/hr");
      else navigate("/candidate");
    } else {
      const exists = users.find((u) => u.email === form.email);
      if (exists) return setError("Email already exists");

      const newUser = {
        id: Date.now(),
        email: form.email,
        password: form.password,
        role: roleType,
        profiles: [
          {
            id: Date.now(),
            name: form.name,
            role: form.role,
            skills: form.skills?.split(",").map((s) => s.trim()) || [],
            github: form.github,
            linkedin: form.linkedin,
            isPublic: false,
          },
        ],
      };

      const updated = [...users, newUser];
      localStorage.setItem("accounts", JSON.stringify(updated));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      if (newUser.role === "hr") navigate("/hr");
      else navigate("/candidate");
    }
  };

  // mouse glow effect
  useEffect(() => {
    const glow = document.getElementById("glow");
    const moveGlow = (e) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", moveGlow);
    return () => document.removeEventListener("mousemove", moveGlow);
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? "Login" : "Sign Up"}</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            type="email"
            required
          />
          <input
            name="password"
            placeholder="Password"
            onChange={handleChange}
            type="password"
            required
          />

          {!isLogin && (
            <>
              <div className="role-toggle">
                <div
                  className={roleType === "candidate" ? "active" : ""}
                  onClick={() => handleRoleSelect("candidate")}
                >
                  Candidate
                </div>
                <div
                  className={roleType === "hr" ? "active" : ""}
                  onClick={() => handleRoleSelect("hr")}
                >
                  HR
                </div>
              </div>
              <input
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required
              />
              <input
                name="role"
                placeholder="Job Role (Frontend/Backend)"
                onChange={handleChange}
              />
              <input
                name="skills"
                placeholder="Skills (comma separated)"
                onChange={handleChange}
              />
              <input
                name="github"
                placeholder="GitHub URL"
                onChange={handleChange}
              />
              <input
                name="linkedin"
                placeholder="LinkedIn URL"
                onChange={handleChange}
              />
            </>
          )}

          <button className="submit-btn" type="submit">
            {isLogin ? "Login" : "Create Account"}
          </button>

          {error && <p className="error-msg">{error}</p>}
        </form>

        <button
          className="switch-btn"
          onClick={() => setIsLogin(!isLogin)}
        >
          Switch to {isLogin ? "Sign Up" : "Login"}
        </button>
      </div>
      <div className="auth-glow" id="glow"></div>
    </div>
  );
}

export default Auth;