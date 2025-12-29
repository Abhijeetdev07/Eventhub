import { Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import CreateEditEvent from './pages/CreateEditEvent'
import Dashboard from './pages/Dashboard'
import EventDetails from './pages/EventDetails'
import Login from './pages/Login'
import MyDashboard from './pages/MyDashboard'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/events/new" element={<CreateEditEvent />} />
            <Route path="/events/:id/edit" element={<CreateEditEvent />} />
            <Route path="/me" element={<MyDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
