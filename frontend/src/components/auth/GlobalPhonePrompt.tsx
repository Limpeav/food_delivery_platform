'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { PhonePromptModal } from '@/components/auth/GooglePhonePromptModal';
import { usePathname } from 'next/navigation';

export function GlobalPhonePrompt() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const pathname = usePathname();

  // Wait until auth state has initialized
  if (!isInitialized || !isAuthenticated || !user) {
    return null;
  }

  // Admin users on the admin panel do not need delivery phone onboarding
  if (user.role === 'ADMIN' && pathname?.startsWith('/admin')) {
    return null;
  }

  // Check if user has no phone number
  const needsPhone = !user.phoneNumber || user.phoneNumber.trim() === '';
  if (!needsPhone) {
    return null;
  }

  return (
    <PhonePromptModal
      isOpen={true}
      user={user}
      onSuccess={() => {
        // State updates automatically via completeProfile in authStore
      }}
    />
  );
}
