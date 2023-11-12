import React, { useEffect, useRef, useState } from 'react'
import browser from 'webextension-polyfill'
import UnsupportedUrl from './unsupportedUrl'

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

  async function executeScriptInActiveTab({ func, args }: { func: (...args: any[]) => any, args: any[] }) {
    try {
      const tab = await getActiveBrowserTab()

      if (!tab?.id) {
        return { error: 'No active tab found' }
      }

      // Execute script in the current tab
      const scriptExecutionResults = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func,
        args
      })

      return scriptExecutionResults[0].result
    } catch (error: any) {
      return { error }
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
      },
      args: [LOCAL_STORAGE_KEY, cmUrlToSet]
    })

    if (result?.error) {
      setLoading(false)
      alert(result.error)
      return
    }

    setMessage('Local CM Set!')
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
          return true
        }
        return false
      },
      args: [LOCAL_STORAGE_KEY]
    })

    if (result?.error) {
      setLoading(false)
      alert(result.error)
      return
    }

    if (result) {
      setMessage('Local CM Cleared!')
    } else {
      setMessage('Nothing to clear')
    }

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

    if (result?.error) {
      setLoading(false)
      alert(result.error)
      return null
    }

    return result;
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
          // Happens if there is no tab, no tab ID, the tab URL is unsupported by the extension, or an error occured while getting the local storage value
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
    return <UnsupportedUrl />
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
