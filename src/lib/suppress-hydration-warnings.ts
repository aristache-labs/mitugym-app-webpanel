/**
 * Suppress hydration warnings caused by browser extensions
 * Chrome extensions often inject attributes like __gchrome_uniqueid
 * which cause hydration mismatches between server and client
 */
export function suppressExtensionHydrationWarnings() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    
    // Suppress specific hydration warnings related to browser extensions
    if (
      typeof errorMessage === 'string' &&
      (
        errorMessage.includes('__gchrome_uniqueid') ||
        errorMessage.includes('Hydration failed') ||
        errorMessage.includes('did not match') ||
        errorMessage.includes('There was an error while hydrating')
      )
    ) {
      // Silently ignore these warnings
      return;
    }
    
    // Pass through all other errors
    originalError.apply(console, args);
  };
}

