import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { saveCurrentCalculation } from '../utils/savedCalculationsStorage'

interface SaveCalculationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SaveCalculationDialog({ isOpen, onClose }: SaveCalculationDialogProps) {
  const [calculationName, setCalculationName] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (!isOpen) {
      setCalculationName('')
    }
  }, [isOpen])

  const handleSave = () => {
    const result = saveCurrentCalculation({
      name: calculationName,
      calculationUrl: window.location.href,
    })

    if (!result.ok) {
      toast({
        title: 'Kunde inte spara',
        description: result.errorMessage,
        status: 'error',
        duration: 3500,
        isClosable: true,
      })
      return
    }

    toast({
      title: 'Berakning sparad',
      description: `${result.savedCalculation.name} (${new Date(result.savedCalculation.createdAt).toLocaleString('sv-SE')})`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Spara berakning</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Namn pa berakning</FormLabel>
            <Input
              placeholder="Ex. Bostadsratt vasastan"
              value={calculationName}
              onChange={(event) => setCalculationName(event.target.value)}
            />
          </FormControl>
          <Text fontSize="sm" color="gray.600" mt={3}>
            Datum laggs till automatiskt. Den fullstandiga URL:en med query params sparas.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Avbryt
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isDisabled={calculationName.trim().length === 0}
          >
            Spara
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}