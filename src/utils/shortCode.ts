import { customAlphabet } from 'nanoid';

// Alphanumeric + hyphens for nanoid generator
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
export const generateShortCode = customAlphabet(alphabet, 7);
