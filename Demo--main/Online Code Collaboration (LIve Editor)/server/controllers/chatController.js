const axios = require('axios');
const User = require('../models/User');

// Generate AI response using OpenAI or other provider
exports.sendMessage = async (req, res) => {
  try {
    const { message, roomId, codeContext } = req.body;
    const userId = req.userId;

    // Validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    // Check if AI is enabled
    if (!process.env.AI_API_PROVIDER) {
      return res.status(503).json({
        success: false,
        message: 'AI provider is not configured',
      });
    }

    const provider = (process.env.AI_API_PROVIDER || '').split('#')[0].trim().toLowerCase();
    if (provider === 'openai' || provider === 'huggingface' || provider === 'gemini') {
      if (!process.env.AI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: 'AI API key is not configured',
        });
      }
    }

    // Get user
    const user = await User.findById(userId);

    // Prepare the AI prompt with context
    let systemPrompt = `You are a helpful AI assistant for a code collaboration platform called Nexus. 
You help programmers write better code, debug issues, and explain concepts.
Be concise, clear, and practical in your responses.`;

    // Add code context if available
    if (codeContext) {
      systemPrompt += `\n\nCurrent code in editor:\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``;
    }

    let response;

    if (provider === 'ollama') {
      response = await getOllamaResponse(message, systemPrompt);
    } else if (provider === 'openai') {
      response = await getOpenAIResponse(message, systemPrompt);
    } else if (provider === 'huggingface') {
      response = await getHuggingFaceResponse(message, systemPrompt);
    } else if (provider === 'gemini') {
      response = await getGeminiResponse(message, systemPrompt);
    } else {
      throw new Error(`AI provider '${provider}' is not supported`);
    }

    res.status(200).json({
      success: true,
      message: response,
      provider,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message,
    });
  }
};

// Get Ollama response (Local LLM)
async function getOllamaResponse(userMessage, systemPrompt) {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';

    const response = await axios.post(
      `${ollamaUrl}/api/generate`,
      {
        model: ollamaModel,
        prompt: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
        stream: false,
        temperature: 0.7,
      },
      {
        timeout: 60000, // 60 second timeout for local inference
      }
    );

    if (response.data && response.data.response) {
      return response.data.response.trim();
    }

    throw new Error('Unexpected response format from Ollama');
  } catch (error) {
    console.error('Ollama error:', error.message);
    if (error.response) {
      console.error('Ollama response status:', error.response.status);
      console.error('Ollama response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('Failed to get AI response from Ollama: ' + error.message);
  }
}

// Get OpenAI response
async function getOpenAIResponse(userMessage, systemPrompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
    let errorMessage = 'Failed to get AI response from OpenAI';

    if (error.response) {
      console.error('OpenAI response error:', error.response.status, error.response.data);
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        errorMessage = 'OpenAI authentication failed. Check your API key.';
      } else if (status === 429) {
        errorMessage = 'OpenAI rate limit exceeded. Please try again later or use a different API key.';
      } else {
        errorMessage = `OpenAI error ${status}: ${data.error?.message || JSON.stringify(data)}`;
      }
    } else {
      console.error('OpenAI network/error:', error.message);
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

// Get Hugging Face response
async function getHuggingFaceResponse(userMessage, systemPrompt) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        inputs: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
        },
      }
    );

    // Extract text from Hugging Face response
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].generated_text;
    }

    throw new Error('Unexpected response format from Hugging Face');
  } catch (error) {
    console.error('HuggingFace error:', error.message);
    if (error.response) {
      console.error('HuggingFace response status:', error.response.status);
      console.error('HuggingFace response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('Failed to get AI response from Hugging Face: ' + (error.response?.data?.error || error.message));
  }
}

// Get Gemini response (Google Gemini API)
async function getGeminiResponse(userMessage, systemPrompt) {
  try {
    const promptText = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    };

    const endpoint = process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    const apiKey = process.env.AI_API_KEY;

    const response = await axios.post(`${endpoint}?key=${apiKey}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Parse Gemini response format
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text;
        if (text) {
          return text;
        }
      }
    }

    console.error('Gemini unexpected response:', JSON.stringify(response.data, null, 2));
    throw new Error('Unexpected response format from Gemini');
  } catch (error) {
    // Try to log response body if available
    if (error.response) {
      console.error('Gemini response status:', error.response.status);
      console.error('Gemini response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Gemini network error:', error.message);
    }
    throw new Error('Failed to get AI response from Gemini: ' + (error.response?.data?.error?.message || error.message));
  }
}

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;

    // TODO: Implement chat history retrieval from database
    // For now, return empty array
    res.status(200).json({
      success: true,
      history: [],
      message: 'Chat history retrieved (feature coming soon)',
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: error.message,
    });
  }
};

// Clear chat history
exports.clearChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;

    // TODO: Implement chat history clearing
    res.status(200).json({
      success: true,
      message: 'Chat history cleared (feature coming soon)',
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message,
    });
  }
};
