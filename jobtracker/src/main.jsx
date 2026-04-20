import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ApplicationProvider } from './context/ApplicationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApplicationProvider>
      <BrowserRouter>
        <App />
        <ToastContainer
          autoClose={2600}
          newestOnTop
          pauseOnFocusLoss={false}
          position="top-right"
          theme="colored"
        />
      </BrowserRouter>
    </ApplicationProvider>
  </React.StrictMode>,
)