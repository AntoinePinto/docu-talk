import { Box, Grid, Heading, VStack, Card, Center, useColorModeValue, Text, Flex, HStack, Avatar, Button, Badge, useBreakpointValue } from '@chakra-ui/react'
import { FiMessageSquare, FiPlus } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface Document {
    id: string
    filename: string
}

interface Chatbot {
    id: string
    title: string
    description: string
    icon: string
    access: string
    user_role: string
    suggested_prompts: string[]
    documents: Document[]
} 

interface ChatbotsSectionProps {
  chatbots: Chatbot[]
  cardBg: string
  headingColor: string
  textColor: string
}

const ChatbotsSection = ({ 
  chatbots,
  cardBg, 
  headingColor, 
  textColor 
}: ChatbotsSectionProps) => {
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const gridTemplateColumns = useBreakpointValue({
    base: "1fr",
    md: "repeat(2, 1fr)"
  })
  
  const blue50 = useColorModeValue('blue.50', 'blue.900')
  const blue100 = useColorModeValue('blue.100', 'blue.800')
  const blue200 = useColorModeValue('blue.200', 'blue.700')
  const blue600 = useColorModeValue('blue.600', 'blue.300')
  const blue700 = useColorModeValue('blue.700', 'blue.200')
  const gray300 = useColorModeValue('gray.300', 'gray.600')
  
  const privateChatbots = chatbots.filter(chatbot => chatbot.access !== "public")
  const publicChatbots = chatbots.filter(chatbot => chatbot.access === "public")

  return (
    <Box mb={6}>
      <Grid 
        templateColumns={gridTemplateColumns} 
        gap={{ base: 4, md: 6 }} 
        position="relative"
      >
        {/* Vertical Line - Only show on desktop */}
        {!isMobile && (
          <Box
            position="absolute"
            left="50%"
            top="0"
            bottom="0"
            width="2px"
            bg={gray300}
          />
        )}

        {/* Private Chatbots Column */}
        <Box
          borderRadius="lg"
          p={{ base: 2, md: 4 }}
        >
          <Center mb={{ base: 2, md: 4 }}>
            <Heading size="sm" color={headingColor}>
              Private Chat Bots
            </Heading>
          </Center>
          {privateChatbots.length === 0 ? (
            <VStack spacing={{ base: 2, md: 4 }} align="stretch">
              <Card
                bg={blue50}
                borderRadius="lg"
                boxShadow="sm"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ 
                  transform: "translateY(-4px)", 
                  boxShadow: "md",
                  cursor: "pointer",
                  bg: blue100
                }}
                onClick={() => navigate('/create-chatbot')}
                border="2px"
                borderColor={blue200}
                borderStyle="dashed"
              >
                <Flex p={{ base: 3, md: 4 }} align="center" justify="space-between">
                  <HStack spacing={{ base: 2, md: 4 }}>
                    <Avatar 
                      size={{ base: "sm", md: "md" }}
                      icon={<FiPlus size="24px" />}
                      bg="blue.500"
                      color="white"
                      border="2px"
                      borderColor="white"
                    />
                    <VStack align="start" spacing={1}>
                      <Heading size="sm" color={blue700}>
                        Create New Private Chatbot
                      </Heading>
                      <Text fontSize="sm" color={blue600} noOfLines={1}>
                        Create a private chatbot with your own documents
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge 
                    colorScheme="blue"
                    variant="solid"
                    bg="blue.500"
                    color="white"
                    display={{ base: "none", md: "block" }}
                  >
                    New
                  </Badge>
                </Flex>
              </Card>
            </VStack>
          ) : (
            <VStack spacing={{ base: 2, md: 4 }} align="stretch">
              <Card
                bg={blue50}
                borderRadius="lg"
                boxShadow="sm"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ 
                  transform: "translateY(-4px)", 
                  boxShadow: "md",
                  cursor: "pointer",
                  bg: blue100
                }}
                onClick={() => navigate('/create-chatbot')}
                border="2px"
                borderColor={blue200}
                borderStyle="dashed"
              >
                <Flex p={{ base: 3, md: 4 }} align="center" justify="space-between">
                  <HStack spacing={{ base: 2, md: 4 }}>
                    <Avatar 
                      size={{ base: "sm", md: "md" }}
                      icon={<FiPlus size="24px" />}
                      bg="blue.500"
                      color="white"
                      border="2px"
                      borderColor="white"
                    />
                    <VStack align="start" spacing={1}>
                      <Heading size="sm" color={blue700}>
                        Create New Private Chatbot
                      </Heading>
                      <Text fontSize="sm" color={blue600} noOfLines={1}>
                        Start a new private conversation with your documents
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge 
                    colorScheme="blue"
                    variant="solid"
                    bg="blue.500"
                    color="white"
                    display={{ base: "none", md: "block" }}
                  >
                    New
                  </Badge>
                </Flex>
              </Card>
              {privateChatbots.map((chatbot) => (
                <Card
                  key={chatbot.id}
                  bg={cardBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: "translateY(-4px)", 
                    boxShadow: "md",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate(`/chat/${chatbot.id}`)}
                >
                  <Flex p={{ base: 3, md: 4 }} align="center" justify="space-between">
                    <HStack spacing={{ base: 2, md: 4 }}>
                      <Avatar 
                        size={{ base: "sm", md: "md" }}
                        src={`data:image/png;base64,${chatbot.icon}`}
                        name={chatbot.title}
                      />
                      <VStack align="start" spacing={1}>
                        <Heading size="sm" color={headingColor}>
                          {chatbot.title}
                        </Heading>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {chatbot.description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      leftIcon={<FiMessageSquare />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/chat/${chatbot.id}`)
                      }}
                      display={{ base: "none", md: "flex" }}
                    >
                      Chat
                    </Button>
                  </Flex>
                </Card>
              ))}
            </VStack>
          )}
        </Box>

        {/* Public Chatbots Column */}
        <Box
          borderRadius="lg"
          p={{ base: 2, md: 4 }}
        >
          <Center mb={{ base: 2, md: 4 }}>
            <Heading size="sm" color={headingColor}>
              Public Chat Bots
            </Heading>
          </Center>
          {publicChatbots.length === 0 ? (
            <Card bg={cardBg} borderRadius="lg" boxShadow="sm" p={{ base: 4, md: 8 }}>
              <VStack spacing={{ base: 2, md: 4 }}>
                <FiMessageSquare size={isMobile ? 32 : 48} color={textColor} />
                <Heading size="md" color={headingColor}>
                  No Public Chatbots Available
                </Heading>
                <Text color={textColor} textAlign="center">
                  There are no public chatbots available at the moment.
                </Text>
              </VStack>
            </Card>
          ) : (
            <VStack spacing={{ base: 2, md: 4 }} align="stretch">
              {publicChatbots.map((chatbot) => (
                <Card
                  key={chatbot.id}
                  bg={cardBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: "translateY(-4px)", 
                    boxShadow: "md",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate(`/chat/${chatbot.id}`)}
                >
                  <Flex p={{ base: 3, md: 4 }} align="center" justify="space-between">
                    <HStack spacing={{ base: 2, md: 4 }}>
                      <Avatar 
                        size={{ base: "sm", md: "md" }}
                        src={`data:image/png;base64,${chatbot.icon}`}
                        name={chatbot.title}
                      />
                      <VStack align="start" spacing={1}>
                        <Heading size="sm" color={headingColor}>
                          {chatbot.title}
                        </Heading>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {chatbot.description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      leftIcon={<FiMessageSquare />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/chat/${chatbot.id}`)
                      }}
                      display={{ base: "none", md: "flex" }}
                    >
                      Chat
                    </Button>
                  </Flex>
                </Card>
              ))}
            </VStack>
          )}
        </Box>
      </Grid>
    </Box>
  )
}

export default ChatbotsSection 