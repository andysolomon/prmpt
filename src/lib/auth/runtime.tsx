import { createContext, ReactNode, useContext } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';

interface RuntimeAuthValue {
  clerkEnabled: boolean;
  isSignedIn: boolean;
  userId: string | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const noopGetToken = async () => null;
const noopSignOut = async () => undefined;

const defaultValue: RuntimeAuthValue = {
  clerkEnabled: false,
  isSignedIn: false,
  userId: null,
  getToken: noopGetToken,
  signOut: noopSignOut,
};

const RuntimeAuthContext = createContext<RuntimeAuthValue>(defaultValue);

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const value: RuntimeAuthValue = {
    clerkEnabled: true,
    isSignedIn: Boolean(auth.isSignedIn),
    userId: auth.userId ?? null,
    getToken: async () => auth.getToken({ template: 'convex' }),
    signOut: async () => auth.signOut(),
  };

  return <RuntimeAuthContext.Provider value={value}>{children}</RuntimeAuthContext.Provider>;
}

export function RuntimeAuthProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return <RuntimeAuthContext.Provider value={defaultValue}>{children}</RuntimeAuthContext.Provider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export function useRuntimeAuth(): RuntimeAuthValue {
  return useContext(RuntimeAuthContext);
}
