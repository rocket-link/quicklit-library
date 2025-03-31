
// Client-side OpenAI integration
// NOTE: Exposing API keys on the client side is not recommended for production apps
// This is for educational purposes only

import type { Book } from "../types/book";
import { toast } from "@/hooks/use-toast";

// Store the API key in local storage
export const setOpenAIKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};

export const getOpenAIKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
};

export const clearOpenAIKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

export const generateBookSummary = async (
  book: Book, 
  bookText: string,
  options: { readingTime?: number } = {}
): Promise<{ success: boolean; summaryText?: string; error?: string }> => {
  try {
    const apiKey = getOpenAIKey();
    
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your OpenAI API key first",
        variant: "destructive"
      });
      return { success: false, error: "API key is missing" };
    }

    // Prepare prompt for summary generation
    const prompt = `
      Create a comprehensive summary of the book "${book.title}" by ${book.author}.
      
      The summary should include:
      1. Key insights (5-7 main points)
      2. Chapter-by-chapter summary
      3. Practical takeaways
      4. Who should read this book
      
      Make the summary engaging and actionable. Target reading time: ${options.readingTime || 15} minutes.
      
      Book text excerpt: ${bookText.substring(0, 2000)}...
    `;

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert book summarizer who creates concise, valuable summaries that capture the essence of books.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summaryText = data.choices[0]?.message?.content;
    
    if (!summaryText) {
      throw new Error('No summary content received');
    }

    return { success: true, summaryText };
  } catch (error) {
    console.error("Error generating summary:", error);
    toast({
      title: "Summary Generation Failed",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive"
    });
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate summary" };
  }
};
