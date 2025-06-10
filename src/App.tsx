import "./styles/global.scss"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import Layout from "./components/Layout"
import Page404 from "./pages/Page404"
import "react-toastify/dist/ReactToastify.css"
import RegisterPage from "./pages/auth/RegisterPage"
import ProjectPage from "./pages/projects/ProjectPage"
import WorkspacePage from "./pages/workspace/WorkspacePage"
import ProfilePage from "./pages/profile/ProfilePage"
import AuthRedirectPage from "./pages/auth/AuthRedirectPage"
import { LoginRegisterChecker } from "./pages/auth/LoginRegisterChecker"
import FAQ from "./pages/FAQ"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <LoginRegisterChecker>
              <LoginPage />
            </LoginRegisterChecker>
          }
        />
        <Route
          path="register"
          element={
            <LoginRegisterChecker>
              <RegisterPage />
            </LoginRegisterChecker>
          }
        />
        <Route path="google-auth-redirect" element={<AuthRedirectPage />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="faq" element={<FAQ />} />
      </Route>

      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
