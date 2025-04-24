import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Box,
  Button,
} from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onDeleteAlertOpen: () => void
}

const SettingsDrawer = ({
  isOpen,
  onClose,
  onDeleteAlertOpen,
}: SettingsDrawerProps) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Settings</DrawerHeader>
        <DrawerBody>
          <VStack spacing={6} align="stretch" pt={4}>
            <Box>
              <Button 
                leftIcon={<FiTrash2 />} 
                colorScheme="red" 
                variant="outline" 
                onClick={onDeleteAlertOpen}
                width="full"
              >
                Delete Account
              </Button>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default SettingsDrawer 