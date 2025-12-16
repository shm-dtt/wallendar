import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Initialize Groq client  
const groq = createGroq({
    apiKey: process.env.API_KEY,
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        console.log('[API] Received completion request with prompt:', prompt);

        // Check if API key is loaded
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error('[API] API_KEY is not set!');
            return new Response(JSON.stringify({ error: 'API key not configured. Get your free key at https://console.groq.com' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        console.log('[API] Groq API Key found:', apiKey.substring(0, 15) + '...');

        console.log('[API] Calling Groq (Llama 3.3 70B)...');
        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: "You are a creative wallpaper assistant. Generate a short, punchy quote (max 10 words) based on the user's requested mood. Do not use quotes around the text. Do not use hashtags. Just the raw text.",
            prompt,
        });

        console.log('[API] Collecting full response...');

        // Collect all tokens into complete text
        let fullText = '';
        for await (const chunk of result.textStream) {
            fullText += chunk;
        }

        console.log('[API] Generated quote:', fullText);

        // Return complete text as plain response (not streaming)
        return new Response(fullText, {
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
