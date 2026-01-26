import { createGroq } from '@ai-sdk/groq';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { streamText } from 'ai';

// Initialize Groq client  
const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

// Rate limit initialization moved inside handler to prevent build-time/runtime crashes if keys are missing

export async function POST(req: Request) {
    try {


        // --- Rate Limiting Strategy ---
        // 1. Identification: Use IP address
        let ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

        // Handle comma-separated IPs (e.g. "client, proxy1, proxy2")
        if (ip.includes(",")) {
            ip = ip.split(",")[0].trim();
        }

        const isDev = process.env.NODE_ENV === 'development';
        const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

        if (hasRedis) {
            // Initialize Ratelimit only when needed and keys are present
            const ratelimit = new Ratelimit({
                redis: Redis.fromEnv(),
                limiter: Ratelimit.slidingWindow(5, "60 s"),
                analytics: true,
                prefix: "@upstash/ratelimit",
            });

            const { success, limit, remaining, reset } = await ratelimit.limit(ip);

            if (!success) {
                console.warn(`[API] Rate limit exceeded for IP: ${ip}`);
                return new Response("Too Many Requests", {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                    }
                });
            }
        } else if (!isDev) {
            // We are in PRODUCTION but keys are missing! 
            // Return a 500 error to stay secure.
            console.error("[API] Critical: Rate limiting unavailable in production. Redis credentials missing.");
            return new Response("Security Configuration Error: Rate limiting is required in production.", { status: 500 });
        } else {
            console.warn("[API] Rate limiting disabled (missing Redis credentials) - allowing request in DEV mode");
        }
        // ------------------------------


        // Parse and validate JSON request
        let body;
        try {
            body = await req.json();
        } catch {
            console.error('[API] Invalid JSON in request body');
            return new Response(JSON.stringify({ error: 'Invalid request format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { prompt } = body;
        console.log('[API] Received completion request with prompt:', prompt);

        // Validate prompt exists and is non-empty
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            console.error('[API] Missing or empty prompt');
            return new Response(JSON.stringify({ error: 'Prompt is required and cannot be empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Whitelist validation: Only allow predefined moods
        const ALLOWED_MOODS = ['Motivational', 'Stoic', 'Funny', 'Chill', 'Hustle'];
        if (!ALLOWED_MOODS.includes(prompt.trim())) {
            console.error('[API] Invalid mood selection:', prompt);
            return new Response(JSON.stringify({ error: 'Invalid mood selection. Please choose from the available options. Motivational, Stoic, Funny, Chill, Hustle' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validate prompt length (reasonable limit)
        if (prompt.length > 100) {
            console.error('[API] Prompt too long:', prompt.length, 'characters');
            return new Response(JSON.stringify({ error: 'Prompt must be 100 characters or less' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if API key is loaded
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('[API] API_KEY is not set!');
            return new Response(JSON.stringify({ error: 'API key not configured. Get your free key at https://console.groq.com' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }


        console.log('[API] Calling Groq (Llama 3.3 70B)...');
        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),
            // system: "You are a creative wallpaper assistant. Generate a short, punchy quote (max 10 words) based on the user's requested mood. Do not use quotes around the text. Do not use hashtags. Just the raw text.",
            system: "You are a minimalist editor. Based on the user's mood, provide a powerful one-liner (max 8 words) that works as a visual statement. The quote should be evocative and popular. Output the raw text only. No quotes, no hashtags, no filler.",
            prompt: prompt.trim(),
        });

        console.log('[API] Collecting full response...');

        // Collect all tokens into complete text
        let fullText = '';
        for await (const chunk of result.textStream) {
            fullText += chunk;
        }

        // Validate response is not empty
        const trimmedText = fullText.trim();
        if (!trimmedText) {
            console.error('[API] AI generated empty response');
            return new Response(JSON.stringify({ error: 'AI generated empty response. Please try again.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('[API] Generated quote:', trimmedText);

        // Return complete text as plain response (not streaming)
        return new Response(trimmedText, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('[API] Error in completion endpoint:', error);
        // @ts-ignore
        if (error.cause) console.error('[API] Error cause:', error.cause);
        // @ts-ignore
        if (error.stack) console.error('[API] Error stack:', error.stack);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({
            error: errorMessage,
            details: error instanceof Error ? error.toString() : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
