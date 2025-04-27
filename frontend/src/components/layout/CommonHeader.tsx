import React, { memo } from 'react';
import {
  Box,
  Container,
  Flex,
  HStack,
  Image,
  IconButton,
  useColorModeValue,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../../public/logo.svg';
import CreditsDisplay from '../ui/CreditsDisplay';
import UserProfile from '../auth/UserProfile';
import HeaderActions from '../layout/HeaderActions';

export interface User {
  friendly_name: string;
  email: string;
  period_dollar_amount: number;
}

interface CommonHeaderProps {
  user?: User;
  remainingCredits?: number | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onSettingsClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

const CommonHeader: React.FC<CommonHeaderProps> = memo(({
  user,
  remainingCredits,
  isRefreshing,
  onRefresh,
  onSettingsClick,
  showBackButton = false,
  onBackClick
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      as="header"
      bg={cardBg}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottom="1px"
      borderColor={borderColor}
      role="banner"
      py={{ base: 2, md: 2 }}
    >
      <Container maxW="container.xl">
        {isMobile ? (
          // Mobile Layout
          <Stack spacing={3}>
            {/* Top Row: Logo and Actions */}
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Image
                  src={logo}
                  alt="Docu Talk Logo"
                  height="1.5rem"
                />
                {showBackButton && (
                  <IconButton
                    aria-label="Back to previous page"
                    icon={<FiArrowLeft />}
                    variant="ghost"
                    onClick={onBackClick}
                    size="sm"
                  />
                )}
              </HStack>
              <HeaderActions
                isRefreshing={isRefreshing ?? false}
                onRefresh={onRefresh ?? (() => {})}
                onOpenSettings={onSettingsClick ?? (() => {})}
              />
            </Flex>
            {/* Bottom Row: Avatar and Credits */}
            {user && (
              <HStack spacing={2} justify="space-between" align="center">
                <UserProfile
                  friendly_name={user.friendly_name}
                  email={user.email}
                />
                <CreditsDisplay
                  remainingCredits={remainingCredits ?? null}
                  period_dollar_amount={user.period_dollar_amount}
                />
              </HStack>
            )}
          </Stack>
        ) : (
          // Desktop Layout
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <Image
                src={logo}
                alt="Docu Talk Logo"
                height="2rem"
              />
              {showBackButton && (
                <IconButton
                  aria-label="Back to previous page"
                  icon={<FiArrowLeft />}
                  variant="ghost"
                  onClick={onBackClick}
                  size="sm"
                />
              )}
              {user && (
                <>
                  <UserProfile
                    friendly_name={user.friendly_name}
                    email={user.email}
                  />
                  <CreditsDisplay
                    remainingCredits={remainingCredits ?? null}
                    period_dollar_amount={user.period_dollar_amount}
                  />
                </>
              )}
            </HStack>
            <HeaderActions
              isRefreshing={isRefreshing ?? false}
              onRefresh={onRefresh ?? (() => {})}
              onOpenSettings={onSettingsClick ?? (() => {})}
            />
          </Flex>
        )}
      </Container>
    </Box>
  );
});

CommonHeader.displayName = 'CommonHeader';

export default CommonHeader; 