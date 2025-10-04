import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Usercontextprovider from './context/Usercontextprovider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Usercontextprovider>
      <App />
    </Usercontextprovider>
  </StrictMode>,
)
