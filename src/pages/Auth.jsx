import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("accounts")) || [];

    // 🔥 LOGIN
    if (isLogin) {
      const user = users.find(u => u.email === form.email);

      if (!user) {
        setError("Email not found");
        return;
      }

      if (user.password !== form.password) {
        setError("Wrong password");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));

      // 🔥 redirect based on role
      if (user.role === "hr") {
        navigate("/hr");
      } else {
        navigate("/candidate");
      }

    }
    // 🔥 SIGN UP
    else {
      const exists = users.find(u => u.email === form.email);

      if (exists) {
        setError("Email already exists");
        return;
      }

      const newUser = {
        id: Date.now(),
        email: form.email,
        password: form.password,

        role: form.roleType, // 🔥 candidate or hr (system role)

        profiles: [
          {
            id: Date.now(),
            name: form.name,
            role: form.role, // 🔥 frontend/backend (job role)
            skills: form.skills?.split(",").map(s => s.trim()) || [],
            github: form.github,
            linkedin: form.linkedin,
            isPublic: false
          }
        ]
      };

      const updated = [...users, newUser];

      localStorage.setItem("accounts", JSON.stringify(updated));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      // 🔥 redirect after signup
      if (newUser.role === "hr") {
        navigate("/hr");
      } else {
        navigate("/candidate");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>

      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" placeholder="Password" onChange={handleChange} />

        {!isLogin && (
          <>
            {/* 🔥 ROLE SELECT */}
            <select name="roleType" onChange={handleChange}>
              <option value="candidate">Candidate</option>
              <option value="hr">HR</option>
            </select>

            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="role" placeholder="Role" onChange={handleChange} />
            <input name="skills" placeholder="Skills" onChange={handleChange} />
            <input name="github" placeholder="GitHub" onChange={handleChange} />
            <input name="linkedin" placeholder="LinkedIn" onChange={handleChange} />
          </>
        )}

        <button type="submit">
          {isLogin ? "Login" : "Create Account"}
        </button>

        {/* 🔥 ERROR MESSAGE */}
        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>
            {error}
          </p>
        )}
      </form>

      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? "Sign Up" : "Login"}
      </button>
    </div>
  );
}

export default Auth;