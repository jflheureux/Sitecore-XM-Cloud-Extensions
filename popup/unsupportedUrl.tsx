import { Alert, AlertDescription, AlertIcon, Stack } from '@chakra-ui/react'
import React from 'react'

export default () => (
  <Stack spacing='6' padding='6'>
    <Alert status='info'>
      <AlertIcon />
      <AlertDescription w='full'>This extension is only enabled on Sitecore XM Cloud Pages.</AlertDescription>
    </Alert>
  </Stack>
)
