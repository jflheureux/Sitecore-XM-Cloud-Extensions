import React, { useEffect, useState } from 'react'
import sitecoreTheme, { toastOptions } from '@sitecore/blok-theme'
import {
  Box,
  ChakraProvider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Link,
  ListItem,
  Spacer,
  Stack,
  Text,
  UnorderedList,
  Wrap,
  useDisclosure,
} from '@chakra-ui/react'
import UnsupportedUrl from './unsupportedUrl'
import { getActiveBrowserTab } from './browserUtils'
import { mdiInformationOutline } from '@mdi/js'
import { SiGithub } from '@icons-pack/react-simple-icons'
import LocalCmUrlForm from './localCmUrlForm'

const App = () => {
  const [initialized, setInitialized] = useState(false)
  const [activeTabIsXMCloudPages, setActiveTabIsXMCloudPages] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  function isSupportedUrl(url) {
    return url?.startsWith('https://perdu.com')
  }

  // Initialization - Called when the popup is open
  useEffect(() => {
    if (!initialized) {
      getActiveBrowserTab().then((tab) => {
        setInitialized(true)

        if (!tab?.id) {
          return
        }
        if (!isSupportedUrl(tab.url)) {
          return
        }

        setActiveTabIsXMCloudPages(true)
      })
    }
  }, [initialized])

  const content = activeTabIsXMCloudPages ? <LocalCmUrlForm /> : <UnsupportedUrl />

  return (
    <ChakraProvider theme={sitecoreTheme} toastOptions={toastOptions}>
      <Box width='md'>
        <Box bg='white' shadow='base' overflow='visible' height='14' padding='3' zIndex='3'>
          <Flex>
            <Image src='https://sitecorecontenthub.stylelabs.cloud/api/public/content/740b04f7a7ca404e96d69319fb98f6b0' alt='Sitecore XM Cloud Logo' />
            <Heading size='xl' marginInlineStart='8px'>Sitecore XM Cloud Extensions</Heading>
            <Spacer />
            <IconButton
              icon={<Icon><path d={mdiInformationOutline} /></Icon>}
              variant='ghost'
              aria-label={''}
              onClick={onOpen}
            />
          </Flex>
        </Box>

        {initialized && content}

        <Drawer onClose={onClose} isOpen={isOpen} size='sm'>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>About Sitecore XM Cloud Extensions</DrawerHeader>
            <DrawerBody>
              <Stack spacing='3'>
                <Text>
                  This extension is a work in progress with only one feature for the moment.
                </Text>
                <Text>
                  Features:
                </Text>
                <UnorderedList marginLeft='6'>
                  <ListItem>Connecting XM Cloud Pages to your local XM Cloud instance</ListItem>
                </UnorderedList>
                <Text>
                  Author: <Link href='https://twitter.com/jflh' target='_blank'>Jeff L'Heureux</Link>
                </Text>
                <Wrap>
                  <Icon as={SiGithub} boxSize='8' color='#181717' _dark={{ color: 'chakra-body-text' }} />
                  <Link href='https://github.com/jflheureux/Sitecore-XM-Cloud-Extensions' target='_blank'>Visit the project repository</Link>
                </Wrap>
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </ChakraProvider>
  )
}

export default App