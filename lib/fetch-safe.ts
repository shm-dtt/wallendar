import https from "https";
import http, { IncomingMessage } from "http";
import net from "net";
import { resolveSafeIp } from "@/lib/ip-utils";

/**
 * Helper to fetch with IP pinning (via lookup override) and redirect handling.
 * This prevents DNS rebinding attacks while preserving SNI for HTTPS.
 */
export async function fetchSafeImage(initialUrl: string, maxRedirects = 5): Promise<IncomingMessage> {
  let currentUrl = initialUrl;
  let redirectCount = 0;
  
  while (true) {
    const parsed = new URL(currentUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');

    const ip = await resolveSafeIp(parsed.hostname); 
    if (!ip) throw new Error('Invalid or inaccessible host');

    // Promisify the request
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      // Hard deadline for the entire request duration
      const controller = new AbortController();
      const totalTimeout = setTimeout(() => controller.abort(), 8000);

      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'Wallendar-Wallpaper-Generator/1.0',
        },
        // Security Magic: Override DNS lookup to return our pre-validated Safe IP.
        // This ensures the connection goes exactly where we checked, preventing TOCTOU.
        lookup: (hostname: string, opts: any, cb: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
            const family = net.isIPv6(ip) ? 6 : 4;
            cb(null, ip, family);
        },
        // Socket idle timeout (separate from total request timeout)
        timeout: 8000,
        signal: controller.signal
      };
      
      const req = (parsed.protocol === 'https:' ? https : http).request(currentUrl, options, (res) => {
        clearTimeout(totalTimeout);
        resolve(res);
      });
      
      req.on('error', (err) => {
        clearTimeout(totalTimeout);
        reject(err);
      });
      
      req.on('timeout', () => {
        clearTimeout(totalTimeout);
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.end();
    });

    // Handle Redirects
    if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (redirectCount >= maxRedirects) {
          response.resume();
          throw new Error('Too many redirects');
        }

        response.resume(); // Discard body
        
        const nextUrl = new URL(response.headers.location, currentUrl);
        
        // Prevent HTTPS -> HTTP downgrade (OWASP security guideline)
        if (parsed.protocol === 'https:' && nextUrl.protocol === 'http:') {
            throw new Error('Refusing to downgrade from HTTPS to HTTP');
        }

        currentUrl = nextUrl.toString();
        redirectCount++;
        continue;
    }

    if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
       response.resume();
       throw new Error(`Failed to fetch image: ${response.statusCode}`);
    }

    return response;
  }
}
