import dns from "node:dns/promises";
import net from "node:net";

// Helper to check if IP is private/reserved
export function isPrivateIp(ip: string): boolean {
  // IPv6 checks
  if (net.isIPv6(ip)) {
    // ::1 (Loopback)
    if (ip === "::1") return true;
    // fc00::/7 (Unique Local)
    if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) return true;
    
    // fe80::/10 (Link Local) - covers fe80 through febf
    if (ip.match(/^fe[89ab][0-9a-f]/i)) return true;

    // ff00::/8 (Multicast)
    if (ip.toLowerCase().startsWith("ff")) return true;

    // ::ffff:127.0.0.1 (IPv4-mapped loopback)
    if (ip.toLowerCase().startsWith("::ffff:127.")) return true;
    // ::ffff:10.0.0.0/8
    if (ip.toLowerCase().startsWith("::ffff:10.")) return true;
     // ::ffff:192.168.0.0/16
    if (ip.toLowerCase().startsWith("::ffff:192.168.")) return true;
    // ::ffff:172.16.0.0/12
    if (ip.match(/^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i)) return true;
    
    // IPv4-mapped Multicast (224.0.0.0 - 239.255.255.255)
    if (ip.match(/^::ffff:(22[4-9]|23[0-9])\./i)) return true;
    // IPv4-mapped Reserved/Future (240.0.0.0 - 255.255.255.255)
    if (ip.match(/^::ffff:(24[0-9]|25[0-5])\./i)) return true;

    return false;
  }

  // IPv4 checks
  if (net.isIPv4(ip)) {
    // 127.0.0.0/8 (Loopback)
    if (ip.startsWith("127.")) return true;
    // 10.0.0.0/8 (Private)
    if (ip.startsWith("10.")) return true;
    // 192.168.0.0/16 (Private)
    if (ip.startsWith("192.168.")) return true;
    // 172.16.0.0/12 (Private)
    if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true;
    // 169.254.0.0/16 (Link Local)
    if (ip.startsWith("169.254.")) return true;
    // 0.0.0.0/8 (Current network)
    if (ip.startsWith("0.")) return true;
    
    // Multicast (224.0.0.0 - 239.255.255.255)
    if (ip.match(/^(22[4-9]|23[0-9])\./)) return true;
    // Reserved/Future/Broadcast (240.0.0.0 - 255.255.255.255)
    if (ip.match(/^(24[0-9]|25[0-5])\./)) return true;

    return false;
  }
  
  return false;
}

// Returns the resolved safe IP if valid, otherwise throws
export async function resolveSafeIp(hostname: string): Promise<string | null> {
  // If it's already an IP, check directly
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return null;
    }
    return hostname;
  }

  try {
    const DNS_TIMEOUT = 5000; // 5 second timeout
    
    let timeoutId: NodeJS.Timeout;
    
    const lookupPromise = new Promise<string>((resolve, reject) => {
      // dns.lookup calls getaddrinfo (system resolver)
      // Using { verbatim: true } usually prefers IPv4 but order isn't guaranteed
      // We resolve strictly one address to pin
      dns.lookup(hostname, { verbatim: true })
        .then(result => resolve(result.address))
        .catch(reject);
    });
    
    const timeoutPromise = new Promise<string>((_, reject) =>
      timeoutId = setTimeout(() => reject(new Error("DNS lookup timeout")), DNS_TIMEOUT)
    );
    
    const address = await Promise.race([lookupPromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    
    if (isPrivateIp(address)) {
      return null;
    }

    return address;
  } catch (e) {
    // Log full error server-side, return null to caller (generic error)
    console.error("DNS resolution failed:", e);
    return null;
  }
}
