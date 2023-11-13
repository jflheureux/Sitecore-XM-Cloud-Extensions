import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './app.tsx'

const pluginTagId = 'sitecore-xm-cloud-extensions-root'
const component = document.getElementById(pluginTagId)!
ReactDOM.createRoot(component).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
