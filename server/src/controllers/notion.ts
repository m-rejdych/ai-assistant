import https from 'https';
import extractor from 'unfluff';
import fetch from 'node-fetch';

import { OPEN_AI_COMPLETIONS } from '../constants/openai';
import { NOTION_API_URL } from '../constants/notion';

interface ExtractionResult {
  title: string;
  text: string;
}

export const generateSummary = async (
  url: string,
  databaseId: string,
  notionApiKey: string,
): Promise<string> => {
  const { text, title } = await new Promise<ExtractionResult>((resolve, reject) => {
    let html = '';

    https
      .get(url, (res) => {
        res.on('error', reject);
        res.on('data', (chunk) => (html += chunk));
        res.on('end', () => {
          const { text, title } = extractor(html, 'en');

          resolve({ text, title });
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
      model: 'gpt-4',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You are very good copywriter that is able to convey clear and valuable information.',
        },
        {
          role: 'user',
          content: `You will be provided with a text labeled {{text}}. Generate an extended summary of this text. Summary should be devided into paragraphs starting with a new line Respond with summary and nothing more.
  
  {{text}}
  ${text}`,
        },
      ],
    }),
  });

  const result = await completion.json();
  const summary: string = result.choices[0].message.content;

  await fetch(NOTION_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionApiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2021-08-16',
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: { content: title },
            },
          ],
        },
        URL: {
          url,
        },
      },
      children: [
        {
          object: 'block',
          heading_3: {
            rich_text: [{ text: { content: 'Summary' } }],
          },
        },
        ...summary.split('\n').map((content) => ({
          object: 'block',
          paragraph: {
            rich_text: [{ text: { content } }],
          },
        })),
      ],
    }),
  });

  return summary;
};
