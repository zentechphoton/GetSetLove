'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { brandColors } from '@/lib/colors'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  imageUrl?: string
  onImageChange: (url: string) => void
  disabled?: boolean
}

export default function ImageUpload({ imageUrl, onImageChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(0)
  const [retryUrl, setRetryUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync preview with imageUrl prop changes
  useEffect(() => {
    if (imageUrl !== preview) {
      setPreview(imageUrl || null)
      setImageError(false)
      setRetryUrl(null)
      setImageKey(prev => prev + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Upload to server immediately without local preview
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      // Check if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        toast.error('Please login to upload images')
        setUploading(false)
        return
      }

      // Determine if user is admin or regular user and if it's blog or news
      const isAdmin = window.location.pathname.startsWith('/admin')
      const isNews = window.location.pathname.includes('/news')
      const endpoint = isNews 
        ? (isAdmin ? '/admin/news/upload-image' : '/user/news/upload-image')
        : (isAdmin ? '/admin/blogs/upload-image' : '/user/blogs/upload-image')
      
      console.log('Uploading to:', endpoint)
      console.log('Token exists:', !!token)
      console.log('FormData contents:', Array.from(formData.entries()))
      
      // Don't set Content-Type manually - let browser set it with boundary
      // The api interceptor will automatically add Authorization header
      const response = await api.post(endpoint, formData)

      console.log('Upload response:', response.data)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      // Try multiple ways to get the URL
      let imageUrl = response.data?.url || response.data?.imageUrl || response.data?.secure_url
      
      // If still no URL, check if response.data is a string (sometimes APIs return just the URL)
      if (!imageUrl && typeof response.data === 'string' && response.data.startsWith('http')) {
        imageUrl = response.data
      }
      
      if (!imageUrl) {
        console.error('No URL in response:', response.data)
        console.error('Response keys:', Object.keys(response.data || {}))
        console.error('Response type:', typeof response.data)
        toast.error(`Upload succeeded but no URL returned. Response: ${JSON.stringify(response.data)}`)
        setUploading(false)
        return
      }
      
      // Validate URL format
      if (!imageUrl.startsWith('http')) {
        console.error('Invalid URL format:', imageUrl)
        toast.error('Invalid image URL received')
        setUploading(false)
        return
      }
      
      console.log('Image uploaded successfully, URL:', imageUrl)
      
      console.log('Setting preview to:', imageUrl)
      setPreview(imageUrl)
      setImageError(false)
      setRetryUrl(null)
      setImageKey(prev => prev + 1)
      onImageChange(imageUrl)
      toast.success('Image uploaded successfully')
      setUploading(false)
    } catch (error: any) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      console.error('Network error:', error.code)
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.')
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Network error. Please check if the backend server is running on http://localhost:8080')
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to upload image'
        toast.error(`Upload failed: ${errorMsg}`)
      }
      setUploading(false)
      // Don't clear preview on error, keep the local preview if it exists
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setImageError(false)
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', preview)
    console.error('Image src:', e.currentTarget.src)
    console.error('Error details:', e)
    
    // Check if it's a Cloudinary URL and might need different handling
    const img = e.currentTarget
    if (preview && preview.includes('cloudinary.com')) {
      console.log('Cloudinary image failed, this might be a CORS or network issue')
    }
    
    setImageError(true)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Featured Image
      </label>
      
      {preview ? (
        <div className="relative group">
          {imageError ? (
            <div className="w-full h-64 flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Image failed to load</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageError(false)
                    // Add cache buster to URL for retry
                    if (preview) {
                      const cacheBuster = preview.includes('cloudinary.com')
                        ? (preview.includes('?') ? '&' : '?') + 'retry=' + Date.now()
                        : ''
                      if (cacheBuster) {
                        setRetryUrl(preview + cacheBuster)
                      } else {
                        setRetryUrl(null)
                      }
                    }
                    setImageKey(prev => prev + 1)
                  }}
                  className="px-4 py-2 text-sm text-white bg-purple-600 dark:bg-purple-500 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                >
                  Retry Loading
                </button>
                {preview && (
                  <div className="px-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      URL: {preview}
                    </p>
                    <button
                      type="button"
                      onClick={() => window.open(preview, '_blank')}
                      className="text-xs text-blue-500 hover:text-blue-600 underline"
                    >
                      Test URL in new tab
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <motion.img
              key={imageKey}
              src={retryUrl || preview || ''}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              loading="eager"
              onError={handleImageError}
              onLoad={() => {
                console.log('Image loaded successfully:', retryUrl || preview)
                setImageError(false)
                setRetryUrl(null) // Clear retry URL on successful load
              }}
            />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                <p className="text-sm">Uploading...</p>
              </div>
            </div>
          )}
          {!disabled && !uploading && (
            <motion.button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          <div className="space-y-2">
            {uploading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
              </>
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

