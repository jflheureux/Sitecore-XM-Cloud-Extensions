import React, { useEffect, useRef, useState } from 'react'
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
import { mdiInformationOutline, mdiCogOutline } from '@mdi/js'
import { SiGithub } from '@icons-pack/react-simple-icons'
import LocalCmUrlForm from './localCmUrlForm'
import Settings from './settings'

const App = () => {
  const [initialized, setInitialized] = useState(false)
  const [activeTabIsXMCloudPages, setActiveTabIsXMCloudPages] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const popupHeight = useRef('');

  function isSupportedUrl(url) {
    if (!url) {
      return false
    }

    return url.startsWith('https://pages.sitecorecloud.io') ||
      url.startsWith('https://pages.sitecore.io') ||
      url.startsWith('https://symphony.sitecorecloud.io')
  }

  function handleInfoButtonClick() {
    popupHeight.current = 'md'
    onOpen();
  }

  function handleInfoSectionClose() {
    popupHeight.current = ''
    onClose();
  }

  function handleSettingsButtonClick() {
    popupHeight.current = 'md'
    onOpen();
  }

  function handleSettingsSectionClose() {
    popupHeight.current = ''
    onClose();
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
      <Box width='md' height={popupHeight.current}>
        <Box bg='white' shadow='base' overflow='visible' height='14' padding='1' zIndex='3' >
          <Flex>
            <Flex padding='2'>
              <Image src='https://sitecorecontenthub.stylelabs.cloud/api/public/content/740b04f7a7ca404e96d69319fb98f6b0' alt='Sitecore XM Cloud Logo' height='8' />
              <Heading size='xl' marginInlineStart='8px'>Sitecore XM Cloud Extensions</Heading>
            </Flex>
            <Spacer />
            <IconButton
              icon={<Icon><path d={mdiInformationOutline} /></Icon>}
              variant='ghost'
              margin='1'
              aria-label={''}
              onClick={handleInfoButtonClick}
            />
          </Flex>
        </Box>

        {initialized && content}

        <Drawer onClose={handleInfoSectionClose} isOpen={isOpen} size='sm'>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>About Sitecore XM Cloud Extensions</DrawerHeader>
            <DrawerBody>
              <Stack spacing='3'>
                <Text>
                  This extension is a work in progress with only one feature for the moment.
                </Text>
                <Box>
                  <Text fontWeight='semibold'>
                    Features:
                  </Text>
                  <UnorderedList marginLeft='6'>
                    <ListItem>Connecting XM Cloud Pages to your local XM Cloud instance</ListItem>
                  </UnorderedList>
                </Box>
                <Box>
                  <Text display='inline' fontWeight='semibold'>Author: </Text>
                  <Link href='https://www.jflh.ca/aboutme' target='_blank'>Jeff L'Heureux</Link>
                </Box>
                <Wrap>
                  <Icon as={SiGithub} boxSize='6' color='#181717' _dark={{ color: 'chakra-body-text' }} />
                  <Link href='https://github.com/jflheureux/Sitecore-XM-Cloud-Extensions' target='_blank'>Visit the project repository</Link>
                </Wrap>
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Drawer onClose={handleSettingsSectionClose} isOpen={isOpen} size='sm'>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>XM Cloud Extension Settings</DrawerHeader>
            <DrawerBody>
              <Settings />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Box bg='white' shadow='base' overflow='visible' height='14' padding='1' zIndex='3' >
          <Flex>
            <Spacer />
            <IconButton
              icon={<Icon><path d={mdiCogOutline} /></Icon>}
              variant='ghost'
              margin='1'
              aria-label={''}
              onClick={handleSettingsButtonClick}
            />
          </Flex>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default App