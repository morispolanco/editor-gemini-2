import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(request, response) {
    const apiKey = process.env.GEMINI_API_KEY;
    const { promptText } = request.body;

    if (!apiKey) {
        return response.status(500).json({ error: 'API key not configured.' });
    }

    if (!promptText) {
        return response.status(400).json({ error: 'Prompt text is required.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(promptText);
        const apiResponse = await result.response;
        const text = apiResponse.text();

        response.status(200).json({ text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Attempt to extract a more specific error message
        const errorMessage = error.message || 'Error desconocido al llamar a la API de Gemini.';
        response.status(500).json({ error: `Error calling Gemini API: ${errorMessage}` });
    }
}