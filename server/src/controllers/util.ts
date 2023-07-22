import https from 'https';
import extractor from 'unfluff';
import fetch from 'node-fetch';

import { OPEN_AI_COMPLETIONS } from '../constants/openai';

export const generateSummary = async (url: string): Promise<string> => {
  const content = await new Promise<string>((resolve, reject) => {
    let html = '';

    https
      .get(url, (res) => {
        res.on('error', reject);
        res.on('data', (chunk) => (html += chunk));
        res.on('end', () => {
          const data = extractor(html, 'en');

          resolve(data.text);
        });
      })
      .on('error', reject);
  });

  const completion = await fetch(OPEN_AI_COMPLETIONS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `You will be provided with a text labeled {{text}}. Generate an extended summary of this text. Respond with summary and nothing more.

{{text}}
${content}`,
        },
      ],
    }),
  });

  const result = await completion.json();
  const summary = result.choices[0].message.content;

  return summary;
};
