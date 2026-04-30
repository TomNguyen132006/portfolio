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
import JobDetail from "./pages/JobDetail";
import JobEdit from "./pages/JobEdit";
import ProjectDetail from "./pages/ProjectDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/auth" element={<Auth />} />

        <Route path="/hr" element={<HR />} />

        <Route path="/candidate" element={<Candidate />} />

        <Route path="/candidate/new" element={<ResumeForm />} />

        <Route path="/users" element={<Users />} />

        <Route path="/users/:id" element={<Profile />} />

        <Route path="/" element={<Auth />} />

        <Route path="/favorites" element={<Favorites />} />
        
        <Route path="/compare" element={<Compare />} />

        <Route path="/candidate/edit/:id" element={<ResumeForm />} />

        <Route path="/hr/view/:id" element={<HRview />} />

        <Route path="/job/view/:id" element={<JobDetail />} />

        <Route path="/job/edit/:id" element={<JobEdit />} />

        <Route path="/project/:username/:repoName" element={<ProjectDetail />} />
        
        <Route path="*" element={<h1>Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;