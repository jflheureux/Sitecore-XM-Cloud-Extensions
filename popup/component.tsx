import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import browser from 'webextension-polyfill'

const LOCAL_STORAGE_KEY = 'Sitecore.Pages.LocalXmCloudUrl'

export default () => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [activeTabIsXMCloudPages, setActiveTabIsXMCloudPages] = useState(false)
  const cmUrlInput = useRef<HTMLInputElement>(null)

  async function getActiveBrowserTab() {
    let [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    return tab
  }

  async function executeScriptInActiveTab({ func, args }: { func: (...args: any[]) => string, args: any[] }) {
    try {
      const tab = await getActiveBrowserTab()

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

      return scriptExecutionResults[0].result
    } catch (error: any) {
      alert(error)
      setMessage(error)
    }
  }

  async function setLocalCmUrl() {
    setLoading(true)

    const cmUrlToSet = cmUrlInput.current?.value;

    if (!cmUrlToSet) {
      setMessage('Please enter a CM URL')
      setLoading(false)
      return
    }

    const result = await executeScriptInActiveTab({
      func: (localStorageKey, cmUrl) => {
        var localXmCloudUrl = cmUrl
        localStorage.getItem(localStorageKey)
        localStorage.setItem(localStorageKey, localXmCloudUrl)
        location.reload()
        return 'Local CM Set!'
      },
      args: [LOCAL_STORAGE_KEY, cmUrlToSet]
    })

    setMessage(result.message)
    setLoading(false)
  }

  async function clearLocalCM() {
    setLoading(true)

    const result = await executeScriptInActiveTab({
      func: (localStorageKey) => {
        var localStorageEntry = localStorage.getItem(localStorageKey)
        if (localStorageEntry) {
          localStorage.removeItem(localStorageKey)
          location.reload()
          return 'Local CM Cleared!'
        }
        return 'Nothing to clear'
      },
      args: [LOCAL_STORAGE_KEY]
    })

    setMessage(result.message)
    setLoading(false)
  }

  async function getCurrentLocalStorageValue() {
    const result = await executeScriptInActiveTab({
      func: (localStorageKey) => {
        var localStorageEntry = localStorage.getItem(localStorageKey)
        if (localStorageEntry) {
          return localStorageEntry
        }
        return ''
      },
      args: [LOCAL_STORAGE_KEY]
    })

    return result.message;
  }

  function isSupportedUrl(url) {
    return url?.startsWith('https://perdu.com')
  }

  // Initialization - Called when the popup is open
  useEffect(() => {
    if (!initialized) {
      getActiveBrowserTab().then((tab) => {
        setInitialized(true)

        if (!tab?.id) {
          return null
        }
        if (!isSupportedUrl(tab.url)) {
          return null
        }

        setActiveTabIsXMCloudPages(true)
        return getCurrentLocalStorageValue();
      }).then((currentLocalStorageValue: string) => {
        if (!currentLocalStorageValue) {
          // Happens if there is no tab, no tab ID, or the tab URL is unsupported by the extension
          return
        }
        if (!cmUrlInput.current) {
          return
        }

        cmUrlInput.current.value = currentLocalStorageValue
      })
    }
  }, [initialized])

  if (!activeTabIsXMCloudPages) {
    return (
      <div className='flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 w-96'>
        <p className='text-white'>The active tab is not Sitecore XM Cloud Pages.</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 w-96'>
      <h1>Sitecore XM Cloud Extensions</h1>
      <input type='text' className='text-sm w-48' ref={cmUrlInput}></input>
      <button
        className='px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48'
        disabled={loading} onClick={setLocalCmUrl}>Set Local CM
      </button>
      <button
        className='px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48'
        disabled={loading} onClick={clearLocalCM}>Clear Local CM
      </button>
      <p className='text-white'>{message}</p>
    </div>
  )
}
