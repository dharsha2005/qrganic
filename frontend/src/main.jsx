import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios';

// Set the base URL for all Axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://qrgaanicc.onrender.com';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

