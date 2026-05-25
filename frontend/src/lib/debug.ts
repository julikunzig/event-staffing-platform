/**
 * Debug utilities for troubleshooting API connectivity
 */

export const debugInfo = () => {
  const info = {
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    fullUrl: window.location.href,
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isLocalNetwork: window.location.hostname === '10.0.0.13',
  }
  
  console.log('=== DEBUG INFO ===')
  console.log('Hostname:', info.hostname)
  console.log('Port:', info.port)
  console.log('Protocol:', info.protocol)
  console.log('Full URL:', info.fullUrl)
  console.log('Is Localhost:', info.isLocalhost)
  console.log('Is Local Network (10.0.0.13):', info.isLocalNetwork)
  console.log('==================')
  
  return info
}

export const testApiConnection = async () => {
  const hostname = window.location.hostname
  const apiUrl = hostname !== 'localhost' && hostname !== '127.0.0.1' 
    ? `http://${hostname}:8000/api/v1`
    : 'http://localhost:8000/api/v1'
  
  console.log('Testing API connection to:', apiUrl)
  
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@platform.com',
        password: 'Admin1234!',
        company_slug: 'platform'
      })
    })
    
    const data = await response.json()
    console.log('API Response Status:', response.status)
    console.log('API Response:', data)
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      apiUrl: apiUrl
    }
  } catch (error) {
    console.error('API Connection Error:', error)
    return {
      success: false,
      error: String(error),
      apiUrl: apiUrl
    }
  }
}
