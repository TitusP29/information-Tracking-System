import './App.css'
import AdminDashboard from './components/Admin/AdminDashboard'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './components/Auth/signup'
import StudentDashboard from './components/Student/StudentDashboard'
import ApplicationIntake from './components/Student/ApplicationIntake'
import Register from './components/Student/Register'
import RegistrationProgress from './components/Student/RegistrationProgress'
import Documents from './components/Student/Documents'
import Login from './components/Auth/login'
import AboutUs from './components/Student/Aboutus'
import StudentLayout from './components/Student/StudentLayout'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Student Routes with Layout */}
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/application-intake" element={<ApplicationIntake />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registration-progress" element={<RegistrationProgress />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/aboutus" element={<AboutUs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
