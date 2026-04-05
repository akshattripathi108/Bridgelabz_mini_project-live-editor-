const axios = require('axios');

// Generate code suggestion/autocomplete
exports.getCodeSuggestion = async (req, res) => {
  try {
    const { code, language, cursorPosition } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required',
      });
    }

    // Check if AI is enabled
    if (!process.env.AI_API_PROVIDER) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured',
      });
    }

    const provider = (process.env.AI_API_PROVIDER || '').split('#')[0].trim().toLowerCase();

    let suggestion;
    if (provider === 'ollama') {
      suggestion = await getOllamaSuggestion(code, language, cursorPosition);
    } else if (provider === 'openai') {
      suggestion = await getOpenAISuggestion(code, language, cursorPosition);
    } else {
      suggestion = await getOllamaSuggestion(code, language, cursorPosition);
    }

    res.status(200).json({
      success: true,
      suggestion,
      provider,
    });
  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestion',
      error: error.message,
    });
  }
};

// Get Ollama code suggestion
async function getOllamaSuggestion(code, language, cursorPosition = null) {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';

    const prompt = `You are a code completion assistant. Complete the following ${language} code. Return ONLY the completion, no explanations.

Code:
\`\`\`${language}
${code}
\`\`\`

Complete the next line or expression:`;

    const response = await axios.post(
      `${ollamaUrl}/api/generate`,
      {
        model: ollamaModel,
        prompt,
        stream: false,
        temperature: 0.3, // Lower temp for more consistent suggestions
      },
      {
        timeout: 30000,
      }
    );

    if (response.data && response.data.response) {
      return response.data.response.trim();
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Ollama suggestion error:', error.message);
    throw new Error('Failed to generate suggestion from Ollama');
  }
}

// Get OpenAI code suggestion
async function getOpenAISuggestion(code, language, cursorPosition = null) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a code completion assistant. Complete the ${language} code. Return ONLY the completion, no explanations or markdown.`,
          },
          {
            role: 'user',
            content: `Complete this code:\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI suggestion error:', error.message);
    throw new Error('Failed to generate suggestion from OpenAI');
  }
}
