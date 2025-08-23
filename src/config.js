const API_BASE_URL = (
    process.env.REACT_APP_API_URL || 
    import.meta.env.VITE_API_URL || 
    process.env.NEXT_PUBLIC_API_URL || 
    "https://backend-production-ce0d.up.railway.app/api"
  );
  
  export { API_BASE_URL };