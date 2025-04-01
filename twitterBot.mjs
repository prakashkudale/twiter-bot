import fetch from 'node-fetch';  // Import fetch using ES Modules
import dotenv from 'dotenv';
import cron from 'node-cron';  // Import node-cron for scheduling
import axios from 'axios';  // We will use axios for API v2 requests

dotenv.config(); // Load environment variables

// Twitter API v2 Bearer Token (This replaces the older v1.1 credentials)
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Hugging Face API key
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Function to generate content from Hugging Face
async function generateContent() {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: 'Write a tweet about cryptocurrency' }), // Modify the prompt as needed
    });

    const data = await response.json();
    return data[0]?.generated_text || 'Default tweet content'; // Return generated text or a fallback
}

// Function to post a tweet using Twitter API v2 (with Bearer Token)
async function postTweet(content) {
    const url = 'https://api.twitter.com/2/tweets'; // Twitter API v2 endpoint
    const data = { status: content }; // API v2 expects tweet content in the 'text' field (not 'status')

    try {
        const response = await axios.post(url, {
            status: content, // Modify the data format if necessary, depending on API v2's expected body
        }, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Tweet posted:', response.data);
    } catch (error) {
        console.log('Error posting tweet:', error.response ? error.response.data : error.message);
    }
}

// Function to run the bot
async function run() {
    const content = await generateContent();  // Get generated content from Hugging Face
    await postTweet(content);  // Post it to Twitter
}

// Schedule the bot to post twice a day at specific times (e.g., 8 AM and 8 PM)
cron.schedule('0 8,20 * * *', () => {
    console.log('Posting tweet at scheduled time...');
    run();
});

console.log('Twitter bot is running...');
