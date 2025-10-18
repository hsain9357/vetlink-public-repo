import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env'; // Assuming you'll use react-native-dotenv or similar for env variables

// Replace with your actual Gemini API key
const geminiApiKey = GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(geminiApiKey);

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export function startNewChat() {
  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1000, // Adjust as needed
    },
  });
}

// Function to get AI response with conversation history
export async function sendMessageToGemini(chat: any, prompt: string, userType: string | null): Promise<string> {
  try {
    let systemInstruction = `You are a helpful and knowledgeable veterinarian. Respond to all queries as if you are a professional veterinarian, providing advice and information related to animal health and care. If a question is outside your scope as a veterinarian, politely state that you cannot answer it. Respond in the language of the user's query. If the query is in Arabic, respond only in Iraqi Arabic accent. IN THE ARABIC LANGUAGE THE USER MOSTLY SPEAK IN IRAQI ACCENT SO ANSWER IN THE IRAQI ACCENT. Users can find veterinarian support on the map screen, accessible from the bottom navigation bar.`;

    if (userType === 'veterinarian') {
      systemInstruction = `You are a highly experienced and specialized veterinarian. Provide detailed, in-depth, and technical responses suitable for a fellow veterinary professional. Assume the user has a strong understanding of veterinary medicine. If a question is outside your scope, politely state that you cannot answer it. Respond in the language of the user's query, using Iraqi Arabic accent if the query is in Arabic.`;
    }

    const veterinarianPrompt = `${systemInstruction}


This application, , helps users find and connect with veterinarians, manage pet profiles, and access veterinary services. Key features include:
- Chat with AI veterinarian (this current feature).
- Map to find nearby veterinarians.
- View detailed veterinarian profiles.
- Manage pet health records.
- Subscription options for premium features.

User: ${prompt}`;
    const result = await chat.sendMessage(veterinarianPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    return 'Error: Unable to get response from AI.';
  }
}