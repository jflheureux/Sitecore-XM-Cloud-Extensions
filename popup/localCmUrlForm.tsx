import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  CloseButton,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Spacer,
  Stack,
  Wrap,
} from '@chakra-ui/react'
import { executeScriptInActiveTab } from './browserUtils'
import { LOCAL_XM_CLOUD_URL_LOCAL_STORAGE_KEY } from './consts'

type Message = {
  description: string;
  status: 'info' | 'success' | 'error';
}

const LocalCmUrlForm = () => {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const cmUrlInput = useRef<HTMLInputElement>(null)

  async function setLocalCmUrl() {
    setLoading(true)

    const cmUrlToSet = cmUrlInput.current?.value;

    if (!cmUrlToSet) {
      setMessage({
        description: 'Please enter a CM URL',
        status: 'error',
      })
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
      args: [LOCAL_XM_CLOUD_URL_LOCAL_STORAGE_KEY, cmUrlToSet]
    })

    if (result?.error) {
      setLoading(false)
      setMessage({
        description: result.error,
        status: 'error',
      })
      return
    }

    setMessage({
      description: 'Local CM Set!',
      status: 'success',
    })
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
      args: [LOCAL_XM_CLOUD_URL_LOCAL_STORAGE_KEY]
    })

    if (result?.error) {
      setLoading(false)
      setMessage({
        description: result.error,
        status: 'error',
      })
      return
    }

    if (result) {
      setMessage({
        description: 'Local CM Cleared!',
        status: 'success',
      })
    } else {
      setMessage({
        description: 'Nothing to clear',
        status: 'info',
      })
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
      args: [LOCAL_XM_CLOUD_URL_LOCAL_STORAGE_KEY]
    })

    if (result?.error) {
      setLoading(false)
      alert(result.error)
      return null
    }

    return result;
  }

  // Initialization - Called when the popup is open
  useEffect(() => {
    if (!initialized) {
      getCurrentLocalStorageValue().then((currentLocalStorageValue: string) => {
        setInitialized(true)
        if (!currentLocalStorageValue) {
          return
        }
        if (!cmUrlInput.current) {
          return
        }

        cmUrlInput.current.value = currentLocalStorageValue
      })
    }
  }, [initialized])

  return (
    <Stack spacing='6' padding='6'>
      <FormControl>
        <FormLabel>Local CM URL</FormLabel>
        <Input ref={cmUrlInput} />
        <FormHelperText>
          With trailing slash. e.g.: https://xmcloudcm.localhost/
        </FormHelperText>
      </FormControl>

      <Flex>
        <Spacer />
        <Wrap align='right'>
          <Button disabled={loading} onClick={clearLocalCM} variant='outline'>Clear</Button>
          <Button disabled={loading} onClick={setLocalCmUrl}>Set</Button>
        </Wrap>
      </Flex>

      {!!message &&
        <Alert status={message.status}>
          <AlertIcon />
          <AlertDescription w='full'>{message.description}</AlertDescription>
          <CloseButton m="-1" onClick={() => setMessage(null)} />
        </Alert>
      }
    </Stack>
  )
}

export default LocalCmUrlForm