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
  
  for (let i = 0; i < maxRedirects; i++) {
    const parsed = new URL(currentUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');

    const ip = await resolveSafeIp(parsed.hostname); 
    if (!ip) throw new Error('Invalid or inaccessible host');

    // Promisify the request
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
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
        timeout: 8000
      };
      
      const req = (parsed.protocol === 'https:' ? https : http).request(currentUrl, options, (res) => {
        resolve(res);
      });
      
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      req.end();
    });

    // Handle Redirects
    if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume(); // Discard body
        // Resolve relative URLs if necessary
        currentUrl = new URL(response.headers.location, currentUrl).toString();
        continue;
    }

    if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
       response.resume();
       throw new Error(`Failed to fetch image: ${response.statusCode}`);
    }

    return response;
  }
  throw new Error('Too many redirects');
}
