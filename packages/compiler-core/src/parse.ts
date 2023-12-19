export interface ParserContext {
  source: string
}

function createParseContext(content: string): ParserContext {
  return {
    source: content,
  }
}

export function baseParse(content: string) {
  const context = createParseContext(content)
  console.log(context)
}
