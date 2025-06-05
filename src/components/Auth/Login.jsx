import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../../supabaseClient'
import { Button } from '../ui/button'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [profileForm, setProfileForm] = useState({ firstName: '', surname: '' })
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [userId, setUserId] = useState(null)
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Authenticate user
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      if (authError) throw authError

      const user = data.user
      setUserId(user.id)
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile && profile.role) {
        setRole(profile.role)
        if (profile.role === 'student') {
          navigate('/student')
        } else {
          navigate('/dashboard')
        }
      } else {
        // No profile: prompt for first name/surname
        setShowProfileForm(true)
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Determine role based on email
    const roleToSet = formData.email.endsWith('@graceartisanschool.education') ? 'admin' : 'student'
    try {
      const { error: profileError } = await supabase.from('user_profile').insert([
        {
          id: userId,
          first_name: profileForm.firstName,
          surname: profileForm.surname,
          role: roleToSet
        }
      ])
      if (profileError) throw profileError
      // Navigate based on role
      if (roleToSet === 'student') {
        navigate('/student')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Profile creation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {showProfileForm ? (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileForm.firstName}
              onChange={handleProfileChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="surname" className="block text-sm font-medium mb-1">Surname</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={profileForm.surname}
              onChange={handleProfileChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Profile & Continue'}</Button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          </form>
          <div className="mt-4 text-center">
            <span>Don't have an account? </span>
            <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </div>
        </>
      )}
    </div>
  )
}

export default Login