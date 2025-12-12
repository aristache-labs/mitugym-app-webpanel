/**
 * iOS Chrome Portrait Navigation Utility
 * 
 * Addresses a known iOS Chrome (CriOS) bug where scroll position is incorrectly
 * restored after SPA navigation when navigating from far down a page.
 * 
 * This only affects:
 * - Chrome on iOS (CriOS) in portrait mode
 * - Safari iOS and desktop browsers work correctly
 * 
 * Solution: Use hard navigation (<a href> / window.location) for iOS Chrome portrait,
 * which guarantees the new page loads at scrollTop = 0.
 */

/**
 * Detects if the current browser is iOS Chrome (CriOS)
 */
export function isIOSChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  return /CriOS/i.test(navigator.userAgent);
}

/**
 * Detects if the device is in portrait orientation
 */
export function isPortrait(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: portrait)").matches;
}

/**
 * Detects if we're on iOS Chrome in portrait mode
 * This combination has the scroll restoration bug
 */
export function isIOSChromePortrait(): boolean {
  return isIOSChrome() && isPortrait();
}

/**
 * Smart navigation function that uses hard navigation for iOS Chrome portrait
 * to avoid scroll restoration bugs, and returns false for normal SPA navigation
 * 
 * @param href - The URL to navigate to
 * @returns true if hard navigation was used, false if SPA navigation should be used
 * 
 * @example
 * const handleClick = () => {
 *   if (!smartNavigate("/some/path")) {
 *     router.push("/some/path");
 *   }
 * };
 */
export function smartNavigate(href: string): boolean {
  if (isIOSChromePortrait()) {
    // Use hard navigation to bypass scroll restoration bug
    window.location.href = href;
    return true;
  }
  return false;
}

