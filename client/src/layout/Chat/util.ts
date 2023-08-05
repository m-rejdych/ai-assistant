export enum ChunkType {
  Text,
  Code,
}

interface ChunkBase<T extends ChunkType> {
  type: T;
}

interface TextChunk extends ChunkBase<ChunkType.Text> {
  value: string;
}

interface CodeChunk extends ChunkBase<ChunkType.Code> {
  lang: string;
  children: TextChunk[];
}

export type Chunk = CodeChunk | TextChunk;

const createTextChunk = (value: string): TextChunk => ({
  type: ChunkType.Text,
  value,
});

const createCodeChunk = (lang: string): CodeChunk => ({
  type: ChunkType.Code,
  children: [],
  lang,
});

export const parseContent = (content: string): Chunk[] => {
  let isInCodeBlock = false;

  return content.split('\n').reduce<Chunk[]>((acc, chunk) => {
    if (chunk.startsWith('```')) {
      const [, lang] = chunk.split('```');
      if (lang) {
        isInCodeBlock = true;
        acc.push(createCodeChunk(lang));
      } else {
        isInCodeBlock = false;
      }
    } else if (isInCodeBlock) {
      (acc[acc.length - 1] as CodeChunk).children.push(createTextChunk(chunk));
    } else {
      acc.push(createTextChunk(chunk));
    }

    return acc;
  }, []);
};
