import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import CreateChatbot from './pages/CreateChatbot'
import ChatbotSettings from './pages/ChatbotSettings'
import Feedback from './pages/Feedback'
import { AuthProvider } from './components/auth/AuthContext'
import { UserProvider } from './components/auth/UserContext'
import PrivateRoute from './components/auth/PrivateRoute'
import Tips from './components/ui/Tips'
import MainLayout from './components/layout/MainLayout'

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <UserProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Tips />
                      <Dashboard />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat/:chatbotId"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Tips />
                      <Chat />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/chatbot/:chatbotId/settings"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Tips />
                      <ChatbotSettings />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-chatbot"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Tips />
                      <CreateChatbot />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Tips />
                      <Feedback />
                    </MainLayout>
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </UserProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
