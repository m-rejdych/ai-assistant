import type { FC } from 'react';
import { CodeBlock, codepen } from 'react-code-blocks';

import { ChunkType, type Chunk } from './util';

export const ContentChunk: FC<Chunk> = (props) => {
  switch (props.type) {
    case ChunkType.Text:
      return <p className="min-h-6 break-words">{props.value}</p>;
    case ChunkType.Code:
      return (
        <CodeBlock
          wrapLongLines
          showLineNumbers={false}
          language={props.lang}
          theme={codepen}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          text={props.children.map(({ value }) => value).join('\n')}
          customStyle={{ opacity: 0.7, borderRadius: '0.5rem' }}
        />
      );
    default:
      return null;
  }
};
