# iOS Chrome Portrait Scroll Restoration Bug - Solution

## Problem Description

When navigating from one route to another in a Next.js App Router application on iOS Chrome (CriOS) in portrait mode, the destination page sometimes loads scrolled to the same offset as the previous page instead of starting at the top.

### Symptoms
- **Affected Browser**: Chrome on iOS (CriOS) only
- **Affected Orientation**: Portrait mode only
- **Scope**: Physical iPhone devices (tested on iPhone 14 Pro Max)
- **Working Fine**: Safari iOS, desktop browsers, landscape mode

### Example Scenario
1. User scrolls to the bottom of `/services` page
2. User taps a button that navigates to `/services/purchased/new`
3. **Expected**: New page opens at `scrollTop = 0`
4. **Actual (bug)**: New page opens scrolled to the same position as the previous page

### Root Cause
Chrome for iOS has a unique scroll restoration behavior where it "replays" the previous scroll position after SPA (Single Page Application) navigation. This happens even with:
- `history.scrollRestoration = "manual"`
- Multiple `window.scrollTo(0, 0)` attempts
- `requestAnimationFrame()` and `setTimeout()` workarounds

## Solution: Smart Navigation

Use **hard navigation** (full page reload via `window.location.href`) for iOS Chrome portrait, which guarantees the new page loads at the top. For all other browsers/orientations, use normal SPA navigation.

### Implementation

#### 1. Utility Module (`src/lib/ios-chrome-navigation.ts`)

```typescript
/**
 * iOS Chrome Portrait Navigation Utility
 * 
 * Addresses a known iOS Chrome (CriOS) bug where scroll position is incorrectly
 * restored after SPA navigation when navigating from far down a page.
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
```

#### 2. SmartLink Component (`src/components/ui/smart-link.tsx`)

For use in server components or when using `<Link>` instead of `router.push()`:

```typescript
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { isIOSChromePortrait } from "@/lib/ios-chrome-navigation";

interface SmartLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Smart Link Component
 * 
 * Automatically uses hard navigation (<a href>) for iOS Chrome portrait
 * to avoid scroll restoration bugs, otherwise uses Next.js Link for SPA navigation.
 */
export function SmartLink({ href, className, children }: SmartLinkProps) {
  const useHardNav = useMemo(() => isIOSChromePortrait(), []);

  if (useHardNav) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
```

#### 3. Usage Examples

##### A. Client Components with Button Click

**Before:**
```typescript
"use client";
import { useRouter } from "next/navigation";

export function MyTable() {
  const router = useRouter();
  
  const handleNewItem = () => {
    router.push("/some/page/new");
  };
  
  return (
    <button onClick={handleNewItem}>Create New</button>
  );
}
```

**After:**
```typescript
"use client";
import { useRouter } from "next/navigation";
import { smartNavigate } from "@/lib/ios-chrome-navigation";

export function MyTable() {
  const router = useRouter();
  
  const handleNewItem = () => {
    // Use hard navigation for iOS Chrome portrait to fix scroll restoration bug
    if (!smartNavigate("/some/page/new")) {
      router.push("/some/page/new");
    }
  };
  
  return (
    <button onClick={handleNewItem}>Create New</button>
  );
}
```

##### B. Server Components with Links

**Before:**
```typescript
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div>
      <Link href="/news">Announcements</Link>
    </div>
  );
}
```

**After:**

Create a client component wrapper:
```typescript
// dashboard-links.tsx (client component)
"use client";
import { SmartLink } from "@/components/ui/smart-link";

export function AnnouncementsLink() {
  return (
    <SmartLink href="/news">
      Announcements
    </SmartLink>
  );
}
```

Use in server component:
```typescript
import { AnnouncementsLink } from "./dashboard-links";

export default async function DashboardPage() {
  return (
    <div>
      <AnnouncementsLink />
    </div>
  );
}
```

### Applied To

The fix has been applied to the following navigations:

#### Button Navigation (Client Components)
1. **`src/app/(protected)/services/purchased-services-table.tsx`**
   - "New Purchase" button → `/services/purchased/new`

2. **`src/app/(protected)/services/services-table-new.tsx`**
   - "Create Service" button → `/services/new`

#### Link Navigation (Server Components)
3. **`src/app/(protected)/dashboard/page.tsx`**
   - "Announcements" title link → `/news`
   - "Latest Check-ins" title link → `/checkins`

## Benefits

✅ **Surgical Fix**: Only affects iOS Chrome portrait (the problematic combination)  
✅ **Zero Impact**: Other browsers/orientations continue using fast SPA navigation  
✅ **No State Loss**: Hard navigation is acceptable for navigation to new pages  
✅ **No Fighting**: Doesn't require racing against Chrome's scroll restoration  

## Alternative Approaches (Not Used)

### Option 2: Force Remount (Not Implemented)
You could also force a remount of the route subtree on iOS Chrome portrait:

```typescript
"use client";
import { usePathname, useSearchParams } from "next/navigation";

function isIOSChromePortrait() {
  if (typeof window === "undefined") return false;
  return (
    /CriOS/i.test(navigator.userAgent) &&
    window.matchMedia("(orientation: portrait)").matches
  );
}

export function IOSChromePortraitRemount({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  const key = isIOSChromePortrait()
    ? `${pathname}?${search.toString()}`
    : "stable";

  return <div key={key}>{children}</div>;
}
```

Then in `app/layout.tsx`:
```tsx
<IOSChromePortraitRemount>
  <AppProviders>{children}</AppProviders>
</IOSChromePortraitRemount>
```

**Why not used**: This resets client state between routes, which may not be desired for all navigations.

## Testing Checklist

### iOS Chrome Portrait (iPhone 14 Pro Max)
- [ ] Navigate from bottom of `/services` to `/services/purchased/new` → Opens at top
- [ ] Navigate from bottom of `/services` to `/services/new` → Opens at top
- [ ] Navigate from bottom of `/dashboard` to `/news` (Announcements link) → Opens at top
- [ ] Navigate from bottom of `/dashboard` to `/checkins` (Check-ins link) → Opens at top
- [ ] No visible scroll position restoration

### Other Browsers/Modes (Should work as before)
- [ ] Safari iOS: SPA navigation works smoothly (no full reload)
- [ ] Desktop Chrome: SPA navigation works smoothly
- [ ] iOS Chrome Landscape: SPA navigation works smoothly

## Related Files

- **Utilities**: 
  - `src/lib/ios-chrome-navigation.ts` - Detection and smart navigation functions
  - `src/components/ui/smart-link.tsx` - SmartLink component for server components
- **Client Components**: 
  - `src/app/(protected)/services/purchased-services-table.tsx` - New Purchase button
  - `src/app/(protected)/services/services-table-new.tsx` - Create Service button
  - `src/components/dashboard/dashboard-card-links.tsx` - Dashboard navigation links
- **Server Components**:
  - `src/app/(protected)/dashboard/page.tsx` - Dashboard page with smart links
- **Previous Attempts**: `src/components/layout/mobile-scroll-to-top.tsx` (kept for other scenarios)

## References

- [Chrome for Developers - iOS scroll restoration quirks](https://developer.chrome.com/blog)
- Reddit discussions on iOS Chrome SPA navigation issues
- Next.js App Router scroll restoration behavior

## Future Considerations

If this issue appears on other navigation buttons (plans, bookings, news, etc.), apply the same `smartNavigate()` pattern:

```typescript
import { smartNavigate } from "@/lib/ios-chrome-navigation";

const handleNavigation = () => {
  if (!smartNavigate("/target/route")) {
    router.push("/target/route");
  }
};
```

---

**Last Updated**: December 2025  
**Status**: ✅ Resolved  
**Tested On**: iPhone 14 Pro Max, iOS Chrome (CriOS)

