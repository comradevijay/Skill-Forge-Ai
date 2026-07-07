// Accepts full YouTube URLs in any common format (watch, youtu.be, embed, shorts)
// or a bare 11-character ID, and returns just the ID. Returns null if it
// can't find a valid-looking ID.
const YT_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export const extractYoutubeId = (input) => {
  if (!input) return null;
  const trimmed = input.trim();

  if (YT_ID_REGEX.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '');
      return YT_ID_REGEX.test(id) ? id : null;
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id && YT_ID_REGEX.test(id) ? id : null;
      }
      if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2];
        return YT_ID_REGEX.test(id) ? id : null;
      }
    }
  } catch {
    // Not a valid URL at all
    return null;
  }

  return null;
};

export default extractYoutubeId;
