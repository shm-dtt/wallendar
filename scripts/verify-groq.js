const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Read .env file manually (to avoid adding dependencies)
const envPath = path.join(process.cwd(), '.env');
let apiKey = process.env.GROQ_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    console.log('Reading .env file...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^GROQ_API_KEY=(.+)$/m);
    if (match) {
        apiKey = match[1].trim();
        // Remove quotes if present
        if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
            apiKey = apiKey.slice(1, -1);
        }
    }
}

if (!apiKey) {
    console.error('❌ Error: GROQ_API_KEY not found in environment or .env file.');
    process.exit(1);
}

console.log(`✅ Found API Key: ${apiKey.substring(0, 5)}...`);

// 2. Make a request to Groq API
const requestBody = JSON.stringify({
    messages: [
        {
            role: "user",
            content: "Test connection."
        }
    ],
    model: "llama-3.3-70b-versatile"
});

const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    }
};

console.log('Connecting to Groq API...');

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Connection Successful!');
            try {
                const json = JSON.parse(data);
                console.log('Response:', json.choices[0].message.content);
            } catch (e) {
                console.log('Response (raw):', data);
            }
        } else {
            console.error(`❌ Request failed with status code: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Connection Error:', error.message);
});

req.write(requestBody);
req.end();
