import { API_ORIGIN } from '../../../config/api';

export const blogImageUrl = (image) =>
  image ? (image.startsWith('http') ? image : `${API_ORIGIN}${image}`) : null;

// Turns "fancy" Unicode letters pasted from social media (𝗕𝗼𝗹𝗱, 𝘐𝘵𝘢𝘭𝘪𝘤, 𝚖𝚘𝚗𝚘) into normal
// letters, so titles use the site font and read correctly with screen readers
export const cleanText = (text = '') => text.normalize('NFKC');

// Posts written with the rich text editor are HTML; older posts are plain text
const HTML_TAG = new RegExp('</?(p|h[1-6]|ul|ol|li|strong|em|a|br|blockquote|span|div)\\b[^>]*>', 'i');
export const isHtml = (content = '') => HTML_TAG.test(content);

const BLOCK_END = new RegExp('</(p|h[1-6]|li|blockquote|div)>', 'gi');
const LINE_BREAK = new RegExp('<br\\s*/?>', 'gi');
const ANY_TAG = new RegExp('<[^>]+>', 'g');

export const toPlainText = (content = '') =>
  isHtml(content)
    ? content.replace(BLOCK_END, ' ').replace(LINE_BREAK, ' ').replace(ANY_TAG, '')
        .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    : content;

// Plain-text excerpt from the post body
export const excerpt = (content = '', length = 160) => {
  const text = cleanText(toPlainText(content)).replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text;
};

// ~200 words per minute, minimum 1 minute
export const readingTime = (content = '') =>
  Math.max(1, Math.round(toPlainText(content).trim().split(/\s+/).filter(Boolean).length / 200));

export const formatPostDate = (post) =>
  new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
