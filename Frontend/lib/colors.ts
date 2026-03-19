// Brand Colors Configuration
export const brandColors = {
  // Primary Brand Colors
  primary: {
    purple: '#9d00ff',
    pink: '#ff006e',
    orange: '#ff6b35',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #9d00ff 0%, #ff006e 100%)',
    secondary: 'linear-gradient(135deg, #b933ff 0%, #9d00ff 100%)',
    warm: 'linear-gradient(135deg, #ff006e 0%, #9d00ff 100%)',
  },
  
  // Admin Sidebar Specific
  admin: {
    activeButtonGradient: 'linear-gradient(135deg, #9d00ff 0%, #ff006e 100%)',
    shadow: 'rgba(157, 0, 255, 0.4)',
    border: 'rgba(157, 0, 255, 0.2)',
  },
  
  // Additional Colors
  additional: {
    hoverPurple: '#7d00cc',
    lightPurple: '#b933ff',
    red: '#ef4444',
    green: '#10b981',
    yellow: '#fbbf24',
  },
  
  // Badge Colors
  badges: {
    blue: {
      bg: '#dbeafe',
      text: '#1e40af',
    },
    green: {
      bg: '#dcfce7',
      text: '#166534',
    },
    purple: {
      bg: '#f3e8ff',
      text: '#7c3aed',
    },
    orange: {
      bg: '#fed7aa',
      text: '#c2410c',
    },
  },
}

// Helper function to get gradient style
export const getGradientStyle = (gradientType: 'primary' | 'secondary' | 'warm' = 'primary') => {
  return {
    background: brandColors.gradients[gradientType],
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }
}

// Helper function to get gradient class (for Tailwind)
export const getGradientClass = (gradientType: 'primary' | 'secondary' | 'warm' = 'primary') => {
  const gradientMap = {
    primary: 'from-[#9d00ff] to-[#ff006e]',
    secondary: 'from-[#b933ff] to-[#9d00ff]',
    warm: 'from-[#ff006e] to-[#9d00ff]',
  }
  return `bg-gradient-to-r ${gradientMap[gradientType]}`
}
