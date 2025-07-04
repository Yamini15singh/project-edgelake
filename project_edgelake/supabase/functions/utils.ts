// Improved function to truncate text with more aggressive summarization
export function truncateText(text: string, maxLength: number = 2500): string {
    if (!text || text.length <= maxLength) return text || '';
    
    // For very large documents, be more aggressive with summarization
    if (text.length > 10000) {
      // Take first 1000 chars as introduction
      const intro = text.substring(0, 1000);
      
      // Take last 1000 chars as conclusion
      const conclusion = text.substring(text.length - 1000);
      
      // Take a small section from the middle
      const middleStart = Math.floor(text.length / 2) - 500;
      const middleSection = text.substring(middleStart, middleStart + 1000);
      
      return `${intro}\n\n[...Document truncated due to length (${text.length} characters total)...]\n\n${middleSection}\n\n[...]\n\n${conclusion}`;
    }
    
    // For moderately large documents, use more balanced summarization
    // Try to find a sentence end near the middle of the text for better readability
    const firstPart = text.substring(0, maxLength / 3);
    
    // Get a small piece from the middle
    const middleStartPos = Math.floor(text.length / 2) - (maxLength / 6);
    const middleSection = text.substring(middleStartPos, middleStartPos + (maxLength / 3));
    
    // Get the last part
    const lastPart = text.substring(text.length - (maxLength / 3));
    
    return `${firstPart}\n\n[...Content omitted due to length...]\n\n${middleSection}\n\n[...Content omitted due to length...]\n\n${lastPart}`;
  }
  

  
  // New function that processes document content to minimize token usage
  export function processDocumentContent(documents: any[]): string {
    if (!documents || documents.length === 0) {
      return 'No health documents have been uploaded yet.';
    }
    
    // Calculate approximate token limit per document to stay under model's context limit
    // Let's save 30% of tokens for system prompt and user messages
    const tokenBudget = 90000; // 70% of 128000 tokens
    const tokensPerDoc = Math.floor(tokenBudget / documents.length);
    
    // Roughly estimate characters per token (approx. 4 chars per token)
    const charsPerToken = 4;
    const maxCharsPerDoc = tokensPerDoc * charsPerToken;
    
    let documentContext = 'Here are summaries of your uploaded health documents:\n\n';
    
    // Process each document to fit within token budget
    for (const item of documents) {
      if (!item.content) {
        continue;
      }
      
      const filename = item.health_data_files?.filename || 'Unnamed document';
      const truncatedContent = truncateText(item.content, maxCharsPerDoc);
      documentContext += `Document: ${filename}\nContent Summary:\n${truncatedContent}\n---\n`;
    }
    
    return documentContext;
  }