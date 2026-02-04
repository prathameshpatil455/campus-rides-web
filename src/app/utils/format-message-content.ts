const LOCATION_LIKE = /coordinates|type:\s*['"]gps['"]|ObjectId/i;
const NAME_PATTERN = /name:\s*['"]([^'"]*)['"]/g;

export function formatMessageContent(content: string | undefined | null): string {
  if (content == null || typeof content !== 'string') {
    return '';
  }
  const trimmed = content.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (!LOCATION_LIKE.test(trimmed) || !trimmed.includes('name:')) {
    return content;
  }
  const matches = [...trimmed.matchAll(NAME_PATTERN)];
  if (matches.length === 0) {
    return content;
  }
  const names = matches.map((m) => m[1].trim()).filter(Boolean);
  return names.length > 0 ? names.join(' → ') : content;
}
