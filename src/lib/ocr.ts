'use client';

// OCR runs 100% on the user's device — images never leave the browser.
// Tesseract.js is dynamically imported to avoid including it in the initial bundle.
export async function extractTextFromImage(file: File): Promise<string> {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('spa', 1, {
    logger: () => {}, // suppress progress logs
  });

  try {
    const { data: { text } } = await worker.recognize(file);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
