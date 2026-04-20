import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ApplicationProvider } from './context/ApplicationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApplicationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApplicationProvider>
  </React.StrictMode>,
)