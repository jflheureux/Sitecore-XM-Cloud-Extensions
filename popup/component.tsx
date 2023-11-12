import React, { useState } from 'react'
import browser from 'webextension-polyfill'

const LOCAL_STORAGE_KEY = "Sitecore.Pages.LocalXmCloudUrl"

export default () => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function executeScriptInActiveTab(func: (...args: any[]) => { message: string }, args: any[]) {
    setLoading(true)

    try {
      let [tab] = await browser.tabs.query({ active: true, currentWindow: true })

      if (!tab?.id) {
        setMessage('No active tab found')
        setLoading(false)
        return
      }

      // Execute script in the current tab
      const scriptExecutionResults = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func,
        args
      })

      const { message } = scriptExecutionResults[0].result

      setMessage(message)
    } catch (error: any) {
      alert(error)
      setMessage(error)
    }

    setLoading(false)
  }

  async function setLocalCM() {
    await executeScriptInActiveTab(
      (localStorageKey) => {
        var localXmCloudUrl = "https://xmcloudcm.localhost/"
        localStorage.getItem(localStorageKey)
        localStorage.setItem(localStorageKey, localXmCloudUrl)
        location.reload()
        return { message: 'Local CM Set!' }
      },
      [LOCAL_STORAGE_KEY]
    )
  }

  async function clearLocalCM() {
    await executeScriptInActiveTab(
      (localStorageKey) => {
        var localStorageEntry = localStorage.getItem(localStorageKey)
        if (localStorageEntry) {
          localStorage.removeItem(localStorageKey)
          location.reload()
          return { message: 'Local CM Cleared!' }
        }
        return { message: 'Nothing to clear' }
      },
      [LOCAL_STORAGE_KEY]
    )
  }

  return (
    <div className='flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 w-96'>
      <h1>Sitecore XM Cloud Extensions</h1>
      <button
        className='px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48'
        disabled={loading} onClick={setLocalCM}>Set Local CM
      </button>
      <button
        className='px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48'
        disabled={loading} onClick={clearLocalCM}>Clear Local CM
      </button>
      <p className='text-white'>{message}</p>
    </div>
  )
}
