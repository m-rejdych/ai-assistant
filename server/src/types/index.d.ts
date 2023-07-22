declare module 'unfluff' {
  interface Data {
    title: string,
    softTitle: string,
    date: string,
    copyright: string,
    author: string[];
    publisher: string,
    text: string,
    image: string,  
    tags: string[],
    videos: string[],
    canonicalLink: string,
    lang: string,
    description: string,
    favicon: string,
    links: {
      text: string;
      href: string;
    }[]
  }

  const extractor: (url: string, locale: string) => Data;

  export default extractor;
};
