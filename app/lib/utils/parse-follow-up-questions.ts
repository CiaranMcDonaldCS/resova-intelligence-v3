/**
 * Parse follow-up questions from AI response markdown
 * Looks for questions after "Follow-up Questions" header
 */
export function parseFollowUpQuestions(content: string): string[] {
  const questions: string[] = [];

  // Look for Follow-up Questions section (case insensitive)
  const followUpRegex = /###\s*(?:💡\s*)?Follow-up Questions:?\s*\n([\s\S]*?)(?=\n###|\n##|$)/i;
  const match = content.match(followUpRegex);

  if (!match) {
    return questions;
  }

  const section = match[1];

  // Extract bullet points (• or -) as questions
  const bulletRegex = /^[•\-]\s*(.+)$/gm;
  let bulletMatch;

  while ((bulletMatch = bulletRegex.exec(section)) !== null) {
    const question = bulletMatch[1].trim();
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Remove follow-up questions section from content for rendering
 */
export function removeFollowUpQuestions(content: string): string {
  const followUpRegex = /###\s*(?:💡\s*)?Follow-up Questions:?\s*\n[\s\S]*?(?=\n###|\n##|$)/i;
  return content.replace(followUpRegex, '').trim();
}
