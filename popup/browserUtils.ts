import browser from 'webextension-polyfill'

export async function getActiveBrowserTab() {
  let [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  return tab
}

export async function executeScriptInActiveTab({ func, args }: { func: (...args: any[]) => any, args: any[] }) {
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
