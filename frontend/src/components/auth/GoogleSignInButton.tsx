'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { toast } from '@/components/ui/Toast';
import { Sparkles, HelpCircle, X } from 'lucide-react';
import { User } from '@/types';
import { GooglePhonePromptModal } from './GooglePhonePromptModal';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  className?: string;
}

declare global {
  interface Window {
    __gsi_initialized_client_id?: string;
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  className = '',
}) => {
  const router = useRouter();
  const { customerGoogleLogin } = useAuthStore();
  const { resolvedTheme } = useThemeStore();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

  // Handle successful Google token verification
  const handleGoogleToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const resp = await customerGoogleLogin(idToken);
      // If user is newly registered or needs phone number, show phone modal
      if (resp.phoneRequired || !resp.user?.phoneNumber) {
        setPendingGoogleUser(resp.user);
        setShowPhoneModal(true);
      } else {
        toast.success(
          'Welcome back, ' + (resp.user?.name || 'Customer') + '! Signed in with Google.'
        );
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Google authentication failed. Please try again.';
      toast.error(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSuccess = (updatedUser: User) => {
    setShowPhoneModal(false);
    setPendingGoogleUser(null);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/');
    }
  };

  // Load Google Identity Services Script
  useEffect(() => {
    if (!googleClientId) return;

    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGisLoaded(true);
    script.onerror = () => {
      console.warn('Failed to load Google Identity Services SDK');
    };
    document.body.appendChild(script);

    return () => {
      // keep script cached
    };
  }, [googleClientId]);

  const handleGoogleTokenRef = useRef(handleGoogleToken);
  useEffect(() => {
    handleGoogleTokenRef.current = handleGoogleToken;
  });

  // Initialize and Render Official Google Button when Client ID is available
  useEffect(() => {
    if (!googleClientId || !gisLoaded || !googleBtnContainerRef.current) return;

    try {
      if (window.google?.accounts?.id) {
        if (window.__gsi_initialized_client_id !== googleClientId) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response?.credential) {
                handleGoogleTokenRef.current(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.__gsi_initialized_client_id = googleClientId;
        }

        // Clear previous rendered button before re-rendering
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text,
            logo_alignment: 'left',
            width: googleBtnContainerRef.current.offsetWidth || 380,
          });
        }
      }
    } catch (e) {
      console.error('Error initializing Google Sign-In:', e);
    }
  }, [googleClientId, gisLoaded, resolvedTheme, text]);

  // Fallback / Development Handler when client ID is not provided or custom button clicked
  const handleCustomButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowConfigModal(true);
    }
  };

  // Demo Google Login for testing without OAuth credentials
  const handleQuickDemoGoogle = async () => {
    setShowConfigModal(false);
    const mockToken = `mock-google-token:email=customer.google@gmail.com&sub=google-user-${Date.now()}&name=Google Customer&picture=https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200`;
    await handleGoogleToken(mockToken);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Visual Button - Styled to match Cravery UI with transparent Google icon (no white background) */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-100 text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>
          {isLoading
            ? 'Connecting to Google...'
            : text === 'signup_with'
            ? 'Sign up with Google'
            : 'Continue with Google'}
        </span>
      </button>

      {/* Interactive Google GIS Iframe overlay (transparent on top to trigger real Google Sign-In) */}
      {googleClientId && (
        <div
          ref={googleBtnContainerRef}
          aria-hidden="true"
          className="absolute inset-0 z-10 w-full h-full overflow-hidden cursor-pointer [&>div]:w-full [&>div]:h-full [&_iframe]:w-full! [&_iframe]:h-full! [&_iframe]:cursor-pointer pointer-events-auto"
          style={{ opacity: 0.001 }}
        />
      )}

      {/* Development / Setup Modal when Client ID is missing */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-[#FF5A1F]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Google Sign-In Ready
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Backend verification & customer auth enabled
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                To enable live Google OAuth popups:
              </p>
              <p>
                Add your Google Cloud Client ID into{' '}
                <code className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono text-[11px] text-orange-600 dark:text-orange-400">
                  frontend/.env.local
                </code>
                :
              </p>
              <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto">
                NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
              </pre>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleQuickDemoGoogle}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Test Now with Demo Google Account (1-Click)
              </button>

              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Phone Number Prompt Modal for New Google Customers */}
      <GooglePhonePromptModal
        isOpen={showPhoneModal}
        user={pendingGoogleUser}
        onSuccess={handlePhoneSuccess}
      />
    </div>
  );
};
