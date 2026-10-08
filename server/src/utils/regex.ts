/** Escapes user input so it can be used literally inside a RegExp. */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function containsRegex(input: string): RegExp {
  return new RegExp(escapeRegex(input), 'i');
}
