import { Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/Dashboard'
import EventDetails from './pages/EventDetails'
import Login from './pages/Login'
import MyDashboard from './pages/MyDashboard'
import MyEvents from './pages/MyEvents'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route element={<ProtectedRoute />}>

            <Route path="/me" element={<MyDashboard />} />
            <Route path="/my-events" element={<MyEvents />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
