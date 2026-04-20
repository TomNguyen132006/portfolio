// src/pages/Auth.jsx
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
      if (!form.email || !form.password || !form.name) {
        return setError("Email, password and name are required.");
      }

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
            name: form.name.trim(),
            email: form.email,
            // Everything else starts empty — editable later in ResumeForm
            role: "",
            skills: [],
            github: "",
            linkedin: "",
            category: "",
            location: "",
            education: "",
            summary: "",
            certifications: [],
            licenses: [],
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
      <div className={`auth-wrapper ${!isLogin ? "active" : ""}`}>

        {/* ── LOGIN FORM ── */}
        <div className="form-section sign-in">
          <h1>Login</h1>
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
            <button className="submit-btn" type="submit">
              Login
            </button>
            {error && <p className="error-msg">{error}</p>}
          </form>
        </div>

        {/* ── SIGNUP FORM ── */}
        <div className="form-section sign-up">
          <h1>Sign Up</h1>
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
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            {/* Role toggle */}
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

            <button className="submit-btn" type="submit">
              Create Account
            </button>

            {error && <p className="error-msg">{error}</p>}

            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px", lineHeight: 1.5 }}>
              You can add your role, skills, GitHub and more after signing up.
            </p>

          </form>
        </div>

        {/* ── OVERLAY ── */}
        <div className="overlay">
          <div className="overlay-panel">
            {isLogin ? (
              <>
                <h2>New here?</h2>
                <p>Create an account to start</p>
                <button onClick={() => { setIsLogin(false); setError(""); }}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <h2>Already have an account?</h2>
                <p>Login to continue</p>
                <button onClick={() => { setIsLogin(true); setError(""); }}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="auth-glow" id="glow"></div>
    </div>
  );
}

export default Auth;