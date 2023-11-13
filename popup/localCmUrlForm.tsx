import React, { ChangeEvent, useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  CloseButton,
  Flex,
  FormControl,
  FormErrorIcon,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Image,
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

type Status = {
  connected: boolean;
  cmUrl?: string;
}

const disconnectedStatus: Status = {
  connected: false
}

const LocalCmUrlForm = () => {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [status, setStatus] = useState(disconnectedStatus)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [cmUrlInputValue, setCmUrlInputValue] = useState<string | null>(null)

  async function handleEditButtonClick() {
    setIsEditing(true)
  }

  async function handleCancelButtonClick() {
    setIsEditing(false)
  }

  async function handleConnectButtonClick() {
    setLoading(true)

    const trimmedCmUrl = cmUrlInputValue?.trim();

    if (!trimmedCmUrl || trimmedCmUrl.length === 0) {
      setMessage({
        description: 'Please enter a non blank CM URL',
        status: 'error',
      })
      setLoading(false)
      return
    }

    const result = await executeScriptInActiveTab({
      func: (localStorageKey, cmUrl) => {
        localStorage.setItem(localStorageKey, cmUrl)
        location.reload()
      },
      args: [LOCAL_XM_CLOUD_URL_LOCAL_STORAGE_KEY, trimmedCmUrl]
    })

    if (result?.error) {
      setLoading(false)
      setMessage({
        description: result.error,
        status: 'error',
      })
      return
    }

    setConnectedStatus(trimmedCmUrl)
    setIsEditing(false)
    setLoading(false)
  }

  async function handleDisconnectButtonClick() {
    setLoading(true)

    const result = await executeScriptInActiveTab({
      func: (localStorageKey) => {
        var localStorageCmUrl = localStorage.getItem(localStorageKey)
        if (localStorageCmUrl) {
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
      setStatus(disconnectedStatus)
    }

    setLoading(false)
  }

  async function handleCmUrlInputChange(e: ChangeEvent<HTMLInputElement>) {
    setCmUrlInputValue(e.target.value)
  }

  async function getCurrentLocalStorageValue() {
    const result = await executeScriptInActiveTab({
      func: (localStorageKey) => {
        var localStorageCmUrl = localStorage.getItem(localStorageKey)
        if (localStorageCmUrl) {
          return localStorageCmUrl
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

  function setConnectedStatus(cmUrl: string) {
    setStatus({
      connected: true,
      cmUrl
    })
  }

  // Initialization - Called when the popup is open
  useEffect(() => {
    if (!initialized) {
      getCurrentLocalStorageValue().then((currentLocalStorageValue: string) => {
        setInitialized(true)
        if (!currentLocalStorageValue) {
          return
        }

        setConnectedStatus(currentLocalStorageValue)
      })
    }
  }, [initialized])

  const statusIconColor = status.connected ? 'success.500' : 'danger.500';
  const statusIconPath = status.connected ? mdiCheckCircle : mdiCircle;
  const statusText = status.connected ? (
    <>
      Connected to <Link href={status.cmUrl} target='_blank'>{status.cmUrl}</Link>
    </>
  ) : 'Disconnected'

  const mainActionButton = status.connected ?
    <Button isDisabled={loading} onClick={handleDisconnectButtonClick}>Disconnect</Button> :
    <Button isDisabled={loading} onClick={handleEditButtonClick}>Connect</Button>

  const cmUrlInputIsNull = cmUrlInputValue === null
  const cmUrlInputIsEmpty = cmUrlInputIsNull ? false : cmUrlInputValue.trim() === ''

  const mainContent = isEditing ? (
    <>
      <FormControl isRequired isInvalid={cmUrlInputIsEmpty}>
        <FormLabel>Local CM URL</FormLabel>
        <Input value={cmUrlInputValue || ''} onChange={handleCmUrlInputChange} />
        <FormHelperText>
          With trailing slash. e.g.: https://xmcloudcm.localhost/
        </FormHelperText>
        <FormErrorMessage>
          <FormErrorIcon />
          Required
        </FormErrorMessage>
      </FormControl>

      <Flex>
        <Spacer />
        <Wrap align='right'>
          <Button isDisabled={loading} onClick={handleCancelButtonClick} variant='outline'>Cancel</Button>
          <Button isDisabled={loading || cmUrlInputIsNull || cmUrlInputIsEmpty} onClick={handleConnectButtonClick}>Connect</Button>
        </Wrap>
      </Flex>
    </>
  ) : (
    <Wrap>
      {mainActionButton}
    </Wrap>
  )

  return (
    <Stack spacing='2' padding='6'>
      <Heading size='sm'>Connect <Image src='https://sitecorecontenthub.stylelabs.cloud/api/public/content/c0ebec446dd1414ab75e5bcdccafc3dc' alt='Sitecore XM Cloud Pages Logo' height='6' display='inline' />Pages to your local XM Cloud instance</Heading>
      <Stack spacing='6'>
        <Box>
          <Text display='inline' fontWeight='semibold'>Status: </Text>
          <Icon color={statusIconColor} height='19px'><path d={statusIconPath} /></Icon>
          <Text display='inline' marginInline='1'>{statusText}</Text>
        </Box>

        {mainContent}

        {!!message &&
          <Alert status={message.status}>
            <AlertIcon />
            <AlertDescription w='full'>{message.description}</AlertDescription>
            <CloseButton m="-1" onClick={() => setMessage(null)} />
          </Alert>
        }
      </Stack>
    </Stack>
  )
}

export default LocalCmUrlForm