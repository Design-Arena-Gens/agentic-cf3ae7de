declare module 'gtts' {
  export default class GTTS {
    constructor(text: string, lang?: string);
    save(path: string, cb: (error?: unknown) => void): void;
  }
}
