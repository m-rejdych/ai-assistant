export interface CompletionResult {
  choices: {
    message: {
      content: string;
    }
  }[]
}
