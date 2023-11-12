import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './app.tsx'

const pluginTagId = 'extension-root'
const component = document.getElementById(pluginTagId)!
ReactDOM.createRoot(component).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
