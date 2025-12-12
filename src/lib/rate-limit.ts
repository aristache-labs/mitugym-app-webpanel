/**
 * Rate limiting utility for API endpoints
 * Uses in-memory store for simplicity - for production, consider Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 10) {
    this.store = new Map();
    this.windowMs = windowMs; // Default: 1 minute
    this.maxRequests = maxRequests; // Default: 10 requests per window
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed and increment counter
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // If no entry or expired, create new entry
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(identifier, entry);

    // Check if limit exceeded
    const allowed = entry.count <= this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - entry.count);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get current limit info without incrementing
   */
  getInfo(identifier: string): { count: number; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      return {
        count: 0,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get total number of tracked identifiers
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Update rate limit configuration
   */
  configure(windowMs: number, maxRequests: number): void {
    (this as unknown as { windowMs: number }).windowMs = windowMs;
    (this as unknown as { maxRequests: number }).maxRequests = maxRequests;
  }
}

// Create global rate limiters for different use cases
// API Key-based rate limiter (stricter)
export const apiKeyRateLimiter = new RateLimiter(60000, 60); // 60 requests per minute per API key

// IP-based rate limiter (more lenient, for general protection)
export const ipRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute per IP

// Member-based rate limiter (prevent spam for specific members)
export const memberRateLimiter = new RateLimiter(60000, 20); // 20 requests per minute per member

/**
 * Get rate limiter configuration from environment or defaults
 */
export function getRateLimitConfig() {
  return {
    apiKey: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '60'),
    },
    ip: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      maxRequests: parseInt(process.env.RATE_LIMIT_IP_MAX || '100'),
    },
    member: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      maxRequests: parseInt(process.env.RATE_LIMIT_MEMBER_MAX || '20'),
    },
  };
}

/**
 * Update rate limiters with database settings
 */
export async function updateRateLimitersFromDB() {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const admin = getSupabaseAdmin();
    if (!admin) return;

    const { data: settings } = await admin
      .from('app_settings')
      .select('key, value')
      .in('key', ['rate_limit_window_ms', 'rate_limit_ip_max', 'rate_limit_api_key_max', 'rate_limit_member_max']);

    if (!settings) return;

    const config = settings.reduce((acc, { key, value }) => {
      acc[key] = parseInt(value || '0');
      return acc;
    }, {} as Record<string, number>);

    const windowMs = config.rate_limit_window_ms || 60000;

    if (config.rate_limit_ip_max) {
      ipRateLimiter.configure(windowMs, config.rate_limit_ip_max);
    }
    if (config.rate_limit_api_key_max) {
      apiKeyRateLimiter.configure(windowMs, config.rate_limit_api_key_max);
    }
    if (config.rate_limit_member_max) {
      memberRateLimiter.configure(windowMs, config.rate_limit_member_max);
    }
  } catch (error) {
    console.error('Failed to update rate limiters from database:', error);
  }
}

/**
 * Get current rate limiter statistics
 */
export function getRateLimiterStats() {
  return {
    ip: {
      activeIdentifiers: ipRateLimiter.size(),
      limit: 100, // Will be updated from config
    },
    apiKey: {
      activeIdentifiers: apiKeyRateLimiter.size(),
      limit: 60,
    },
    member: {
      activeIdentifiers: memberRateLimiter.size(),
      limit: 20,
    },
  };
}

/**
 * Create identifier for rate limiting
 */
export function createRateLimitIdentifier(type: 'api_key' | 'ip' | 'member', value: string): string {
  return `${type}:${value}`;
}

