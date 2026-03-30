import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import HR from "./pages/HR";
import Candidate from "./pages/Candidate";
import ResumeForm from "./pages/ResumeForm";
import Favorites from "./pages/Favorites";
import Compare from "./pages/Compare";
import HRview from "./pages/HR-view";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 Auth first */}
        <Route path="/auth" element={<Auth />} />

        {/* 👨‍💼 HR */}
        <Route path="/hr" element={<HR />} />

        {/* 👤 Candidate */}
        <Route path="/candidate" element={<Candidate />} />

        <Route path="/candidate/new" element={<ResumeForm />} />

        {/* (optional old routes) */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<Profile />} />

        {/* 🏠 Default → Auth */}
        <Route path="/" element={<Auth />} />

        <Route path="/favorites" element={<Favorites />} />
        
        <Route path="/compare" element={<Compare />} />
        <Route path="/candidate/edit/:id" element={<ResumeForm />} />

        <Route path="/hr/view/:id" element={<HRview />} />

        

        {/* ❌ 404 MUST BE LAST */}
        <Route path="*" element={<h1>Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;