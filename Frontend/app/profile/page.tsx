'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import UserSidebar from '@/components/Layout/UserSidebar'
import { SidebarProvider, useSidebar } from '@/components/Layout/SidebarContext'
import toast from 'react-hot-toast'
import { brandColors } from '@/lib/colors'
import {
  UserCircleIcon,
  PhotoIcon,
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PencilIcon,
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

function UserProfileContent() {
  const router = useRouter()
  const { user, token, initialize, _hasHydrated } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('photos')
  const [photos, setPhotos] = useState<string[]>([])
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'not_verified'>('not_verified')
  const [requestingVerification, setRequestingVerification] = useState(false)
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [formData, setFormData] = useState({
    bio: '',
    age: '',
    location: '',
    occupation: '',
    education: '',
    interests: '',
    height: '',
    lookingFor: '',
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!_hasHydrated) {
      return // Wait for hydration
    }
    
    if (!token || !user) {
      router.push('/auth/login')
      return
    }
    if (user.role === 'admin' || user.role === 'super_admin') {
      router.push('/admin/profile')
      return
    }
    setLoading(false)
    // TODO: Fetch user profile data from API
    fetchProfileData()
  }, [token, user, router, _hasHydrated])

  const fetchProfileData = async () => {
    // TODO: Replace with actual API call
    setPhotos([
      `https://ui-avatars.com/api/?name=${user?.username}&size=400&background=9d00ff&color=fff`,
      `https://ui-avatars.com/api/?name=${user?.username}&size=400&background=ff006e&color=fff`,
    ])
    setFormData({
      bio: 'Love traveling, good food, and meaningful conversations. Looking for someone special to share life adventures with!',
      age: '28',
      location: 'New York, NY',
      occupation: 'Software Engineer',
      education: 'University Graduate',
      interests: 'Travel, Photography, Reading, Cooking',
      height: '5\'10"',
      lookingFor: 'A serious relationship',
    })
    
    // Set verification status based on user data
    if (user?.is_verified) {
      setVerificationStatus('verified')
    }
  }

  const handleRequestVerification = async () => {
    if (!verificationDocument) {
      toast.error('Please upload a verification document')
      return
    }

    setRequestingVerification(true)
    try {
      // In a real app, you would upload the document first, then send the URL
      // For now, we'll just send the request
      console.log('🔵 Sending verification request to /user/verification/request')
      const response = await api.post('/user/verification/request', {
        document_url: '', // Would be the uploaded document URL
        message: verificationMessage,
      })

      console.log('✅ Verification request response:', response.data)
      if (response.data) {
        toast.success(response.data.message || 'Verification request submitted successfully!')
        setVerificationStatus('pending')
        setVerificationDocument(null)
        setVerificationMessage('')
      }
    } catch (error: any) {
      console.error('❌ Verification request error:', error)
      console.error('❌ Error response:', error.response)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to submit verification request'
      toast.error(`Failed to submit verification request: ${errorMsg}`)
    } finally {
      setRequestingVerification(false)
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setVerificationDocument(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Update profile via API
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // TODO: Upload photos to server
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file))
      setPhotos([...photos, ...newPhotos])
      toast.success('Photos uploaded!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'photos', name: 'Photos', icon: PhotoIcon },
    { id: 'about', name: 'About Me', icon: UserCircleIcon },
    { id: 'preferences', name: 'Preferences', icon: HeartIcon },
    { id: 'verification', name: 'Verification', icon: ShieldCheckIcon },
  ]

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 flex flex-col w-full">
      <UserSidebar />
      <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Make your profile stand out and attract your perfect match
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircleIcon className="h-20 w-20 text-white" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                <CameraIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username}
                {user?.is_verified && (
                  <CheckCircleIcon className="inline-block h-5 w-5 text-blue-500 ml-2" />
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  {formData.age} years old
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                  {formData.location}
                </span>
                {user?.is_verified && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircleIcon className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {user?.is_premium && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-slate-700">
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Photos</h3>
                <label
                  className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg"
                  style={{ background: brandColors.gradients.primary }}
                >
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Add Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Add up to 6 photos. More photos increase your match rate by 60%!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                    <div className="text-center">
                      <PhotoIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* About Me Tab */}
          {activeTab === 'about' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">About Me</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    style={{ borderColor: brandColors.primary.purple + '40' }}
                    placeholder="Tell potential matches about yourself..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MapPinIcon className="inline h-4 w-4 mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="Your age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <BriefcaseIcon className="inline h-4 w-4 mr-1" />
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="What do you do?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <AcademicCapIcon className="inline h-4 w-4 mr-1" />
                      Education
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="Your education"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="e.g., 5'10&quot;"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Interests
                    </label>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="Hobbies, interests, etc."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{ background: brandColors.gradients.primary }}
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Dating Preferences</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Looking For
                  </label>
                  <select
                    value={formData.lookingFor}
                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                    style={{ borderColor: brandColors.primary.purple + '40' }}
                  >
                    <option>Casual dating</option>
                    <option>Serious relationship</option>
                    <option>Marriage</option>
                    <option>Friendship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Age Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Min age"
                      className="px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                    />
                    <input
                      type="number"
                      placeholder="Max age"
                      className="px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Distance
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1 mile</span>
                    <span>50 miles</span>
                    <span>100+ miles</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{ background: brandColors.gradients.primary }}
                >
                  Save Preferences
                </button>
              </form>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Verification</h3>
              
              {/* Verification Status Card */}
              <div className="mb-6">
                {verificationStatus === 'verified' ? (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                          <CheckCircleIcon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          Your Profile is Verified
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your profile has been verified by our team. This badge helps build trust with other users.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : verificationStatus === 'pending' ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-yellow-500 flex items-center justify-center">
                          <ClockIcon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          Verification Under Review
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your verification request is being reviewed by our team. We'll notify you once it's processed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-gray-400 flex items-center justify-center">
                          <ExclamationCircleIcon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          Profile Not Verified
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get verified to build trust and increase your match rate. Upload a clear photo of your ID or a selfie.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Request Form */}
              {verificationStatus !== 'verified' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Request Verification
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      To verify your profile, please upload a clear photo of a government-issued ID or a selfie holding your ID.
                      This helps us ensure the safety and authenticity of our community.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <DocumentTextIcon className="inline h-4 w-4 mr-1" />
                      Verification Document <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      {verificationDocument ? (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {verificationDocument.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(verificationDocument.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setVerificationDocument(null)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors bg-gray-50 dark:bg-slate-700">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Accepted formats: JPG, PNG, GIF. Maximum file size: 5MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Additional Message (Optional)
                    </label>
                    <textarea
                      value={verificationMessage}
                      onChange={(e) => setVerificationMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"
                      style={{ borderColor: brandColors.primary.purple + '40' }}
                      placeholder="Add any additional information that might help with verification..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {verificationMessage.length}/500 characters
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-semibold mb-1">Why verify your profile?</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          <li>Build trust with other users</li>
                          <li>Increase your match rate by up to 40%</li>
                          <li>Get priority in search results</li>
                          <li>Show that you're serious about finding a match</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRequestVerification}
                    disabled={!verificationDocument || requestingVerification}
                    className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    style={{ background: brandColors.gradients.primary }}
                  >
                    {requestingVerification ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="h-5 w-5" />
                        <span>Request Verification</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default function UserProfile() {
  return (
    <SidebarProvider>
      <UserProfileContent />
    </SidebarProvider>
  )
}

