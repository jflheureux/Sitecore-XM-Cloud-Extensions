import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
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
  Icon,
  Image,
  Input,
  Link,
  Spacer,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { executeScriptInActiveTab } from './browserUtils'
import { LOCAL_XM_CLOUD_URL_LOCAL_STORAGE_KEY } from './consts'
import { mdiCheckCircle, mdiCircle } from '@mdi/js'

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

const URL_VALIDATION_REGEXP = new RegExp('^http[s]?:\\/\\/[^\\.]+\\.[^.]+.*', 'i')

const LocalCmUrlForm = () => {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [status, setStatus] = useState(disconnectedStatus)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [cmUrlInputValue, setCmUrlInputValue] = useState<string | null>(null)

  function handleEditButtonClick() {
    setIsEditing(true)
  }

  function handleCancelButtonClick() {
    setIsEditing(false)
  }

  async function handleConnectButtonClick() {
    setLoading(true)

    let trimmedCmUrl = cmUrlInputValue?.trim();

    if (!trimmedCmUrl || trimmedCmUrl.length === 0) {
      setMessage({
        description: 'Please enter a non blank CM URL',
        status: 'error',
      })
      setLoading(false)
      return
    }

    // Extract the right URL part to set in local storage
    const indexOfThirdSlash = trimmedCmUrl.indexOf('/', 8)
    if (indexOfThirdSlash > 0) {
      trimmedCmUrl = trimmedCmUrl.slice(0, indexOfThirdSlash + 1)
    } else {
      trimmedCmUrl = trimmedCmUrl + '/'
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

  function handleCmUrlInputChange(e: ChangeEvent<HTMLInputElement>) {
    setCmUrlInputValue(e.target.value)
  }

  function handleEnterKeyPress<T = Element>(func: () => void) {
    return handleKeyPress<T>(func, "Enter")
  }

  function handleKeyPress<T = Element>(func: () => void, key: string) {
    return (e: KeyboardEvent<T>) => {
      if (e.key === key) {
        func()
      }
    }
  }

  function handleCmUrlInputEnterKeyPress() {
    if (ValidateCmUrlInputValue()) {
      handleConnectButtonClick()
    }
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

  function ValidateCmUrlInputValue() {
    if (isCmUrlInputNull) {
      return true
     }

     const trimmedCmUrl = cmUrlInputValue.trim();

     if (trimmedCmUrl.length === 0) {
      return false
     }

     return URL_VALIDATION_REGEXP.test(trimmedCmUrl)
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

  const tip = status.connected && (
    <Box>
      <Text display='inline' fontWeight='semibold'>Tip: </Text>
      <Text display='inline' marginInline='1'>If you experience CORS issues, ensure that your main <Text as='kbd'>.env</Text> file and your CM Docker Compose container have these 3 environment variables defined:</Text>
      <Text as='kbd' display='block'>SITECORE_Pages_Client_Host</Text>
      <Text as='kbd' display='block'>SITECORE_Pages_CORS_Allowed_Origins</Text>
      <Text as='kbd' display='block'>SITECORE_GRAPHQL_CORS</Text>
      <Text>Variable values can be found in the <Link href='https://doc.sitecore.com/xmc/en/developers/xm-cloud/connect-xm-cloud-pages-to-your-local-xm-cloud-instance.html' target='_blank'>Sitecore XM Cloud documentation</Link>.</Text>
    </Box>
  )

  const mainActionButton = status.connected ?
    <Button isDisabled={loading} onClick={handleDisconnectButtonClick}>Disconnect</Button> :
    <Button isDisabled={loading} onClick={handleEditButtonClick}>Connect</Button>

  const isCmUrlInputNull = cmUrlInputValue === null
  const isCmUrlInputValid = ValidateCmUrlInputValue()

  const mainContent = isEditing ? (
    <>
      <FormControl isRequired isInvalid={!isCmUrlInputValid}>
        <FormLabel>Local Instance CM URL</FormLabel>
        <Input
          value={cmUrlInputValue || ''}
          onChange={handleCmUrlInputChange}
          onKeyDown={handleEnterKeyPress(handleCmUrlInputEnterKeyPress)}
        />
        <FormHelperText>
          E.g.: https://xmcloudcm.localhost/
        </FormHelperText>
        <FormErrorMessage>
          <FormErrorIcon />
          A valid URL is required
        </FormErrorMessage>
      </FormControl>

      <Flex>
        <Spacer />
        <Wrap align='right'>
          <Button isDisabled={loading} onClick={handleCancelButtonClick} variant='outline'>Cancel</Button>
          <Button isDisabled={loading || isCmUrlInputNull || !isCmUrlInputValid} onClick={handleConnectButtonClick}>Connect</Button>
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
      <Heading size='sm'>
        Connect{' '}
        <Image
          src='https://sitecorecontenthub.stylelabs.cloud/api/public/content/c0ebec446dd1414ab75e5bcdccafc3dc'
          alt='Sitecore XM Cloud Pages Logo'
          height='6'
          display='inline'
        />{' '}
        Pages to your Local XM Cloud Instance
      </Heading>
      <Stack spacing='6'>
        <Box>
          <Text display='inline' fontWeight='semibold'>Status: </Text>
          <Icon color={statusIconColor} height='19px'><path d={statusIconPath} /></Icon>
          <Text display='inline' marginInline='1'>{statusText}</Text>
        </Box>

        {tip}
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