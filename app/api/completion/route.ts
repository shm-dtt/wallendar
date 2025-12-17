import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Initialize Groq client  
const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
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
            system: "You are a creative wallpaper assistant. Generate a short, punchy quote (max 10 words) based on the user's requested mood. Do not use quotes around the text. Do not use hashtags. Just the raw text.",
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
