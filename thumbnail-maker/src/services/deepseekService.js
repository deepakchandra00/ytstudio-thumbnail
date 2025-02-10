const axios = require('axios');

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';
  }

  async generateThumbnailSuggestions(videoTitle, description) {
    try {
      const response = await axios.post(
        `${this.baseURL}/completions`,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert at creating engaging YouTube thumbnail text. Generate catchy, clickable text suggestions that are short and impactful."
            },
            {
              role: "user",
              content: `Generate 5 thumbnail text suggestions for a YouTube video with the following title: "${videoTitle}" and description: "${description}". Keep each suggestion under 40 characters.`
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestions = response.data.choices[0].message.content
        .split('\n')
        .filter(text => text.length > 0)
        .map(text => ({
          text: text.replace(/^\d+\.\s*/, '').trim(),
          score: Math.random() * 0.3 + 0.7 // Simulated relevance score between 0.7 and 1.0
        }));

      return suggestions;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('Failed to generate thumbnail suggestions');
    }
  }
}

module.exports = new DeepSeekService(); 