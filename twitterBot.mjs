import Twit from 'twit';  // Import Twit using ES Modules
import fetch from 'node-fetch';  // Import fetch using ES Modules
import dotenv from 'dotenv';
import cron from 'node-cron';  // Import node-cron for scheduling

dotenv.config(); // Load environment variables

// Set up your Twitter API credentials
const twitterClient = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

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

// Function to post a tweet to Twitter
function postTweet(content) {
    twitterClient.post('statuses/update', { status: content }, function (err, data, response) {
        if (err) {
            console.log('Error posting tweet:', err);
        } else {
            console.log('Tweet posted:', data.text);
        }
    });
}

// Function to run the bot
async function run() {
    const content = await generateContent();  // Get generated content from Hugging Face
    postTweet(content);  // Post it to Twitter
}

// Schedule the bot to post twice a day at specific times (e.g., 8 AM and 8 PM)
cron.schedule('0 8,20 * * *', () => {
    console.log('Posting tweet at scheduled time...');
    run();
});

console.log('Twitter bot is running...');
