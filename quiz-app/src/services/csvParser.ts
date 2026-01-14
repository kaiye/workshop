import type { Question } from '../types/game';

interface CSVRow {
  questionNumber: string;
  questionText: string;
  answer1: string;
  answer2: string;
  answer3?: string;
  answer4?: string;
  timeLimit: string;
  correctAnswer: string;
}

/**
 * Parse CSV content into Question array
 * Expected CSV format:
 * Question #,Question Text,Answer 1,Answer 2,Answer 3 (Optional),Answer 4 (Optional),Time Limit (sec),Correct Answer(s)
 */
export function parseCSV(csvContent: string): Question[] {
  const lines = csvContent.trim().split('\n');

  // Find the header row (skip empty lines at the beginning)
  let headerIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for a line that starts with "Question" (header row)
    if (line.toLowerCase().startsWith('question')) {
      headerIndex = i;
      break;
    }
  }

  if (lines.length < headerIndex + 2) {
    throw new Error('CSV file must contain a header row and at least one question');
  }

  // Skip header row and get data lines
  const dataLines = lines.slice(headerIndex + 1);
  const questions: Question[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const row = parseCSVLine(line);
    if (row.length < 6) {
      throw new Error(`Row ${i + 2} has insufficient columns`);
    }

    const csvRow: CSVRow = {
      questionNumber: row[0],
      questionText: row[1],
      answer1: row[2],
      answer2: row[3],
      answer3: row[4] || undefined,
      answer4: row[5] || undefined,
      timeLimit: row[6] || '15',
      correctAnswer: row[7] || '1',
    };

    const options = [csvRow.answer1, csvRow.answer2];
    if (csvRow.answer3) options.push(csvRow.answer3);
    if (csvRow.answer4) options.push(csvRow.answer4);

    // Handle multiple correct answers (e.g., "1,2" or "1;2")
    const correctAnswerStr = csvRow.correctAnswer.replace(/;/g, ',');
    const correctAnswers = correctAnswerStr.split(',').map(s => parseInt(s.trim(), 10));
    const correctAnswer = correctAnswers[0] || 1;

    const question: Question = {
      id: parseInt(csvRow.questionNumber, 10) || i + 1,
      text: csvRow.questionText,
      options,
      correctAnswer,
      timeLimit: parseInt(csvRow.timeLimit, 10) || 15,
    };

    questions.push(question);
  }

  if (questions.length === 0) {
    throw new Error('No valid questions found in CSV');
  }

  return questions;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push last field
  result.push(current.trim());

  return result;
}

/**
 * Read and parse a CSV file
 */
export async function parseCSVFile(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const questions = parseCSV(content);
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate CSV format and return any errors
 */
export function validateCSV(csvContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = csvContent.trim().split('\n');

  // Find the header row (skip empty lines at the beginning)
  let headerIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith('question')) {
      headerIndex = i;
      break;
    }
  }

  if (lines.length < headerIndex + 2) {
    errors.push('CSV file must contain a header row and at least one question');
    return { valid: false, errors };
  }

  const dataLines = lines.slice(headerIndex + 1);

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const row = parseCSVLine(line);
    const rowNum = headerIndex + i + 2; // Account for header position

    if (row.length < 6) {
      errors.push(`Row ${rowNum}: Insufficient columns (minimum 6 required)`);
      continue;
    }

    if (!row[1]?.trim()) {
      errors.push(`Row ${rowNum}: Question text is empty`);
    }

    if (!row[2]?.trim() || !row[3]?.trim()) {
      errors.push(`Row ${rowNum}: At least 2 answers are required`);
    }

    const timeLimit = parseInt(row[6], 10);
    if (row[6] && (isNaN(timeLimit) || timeLimit <= 0)) {
      errors.push(`Row ${rowNum}: Invalid time limit`);
    }

    const correctAnswer = parseInt(row[7], 10);
    const optionCount = [row[2], row[3], row[4], row[5]].filter(Boolean).length;
    if (row[7] && (isNaN(correctAnswer) || correctAnswer < 1 || correctAnswer > optionCount)) {
      errors.push(`Row ${rowNum}: Invalid correct answer (must be between 1 and ${optionCount})`);
    }
  }

  return { valid: errors.length === 0, errors };
}
