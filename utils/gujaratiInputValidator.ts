// Utility to validate and restrict input to Gujarati characters only

/**
 * Checks if a character is a Gujarati character
 * Gujarati Unicode range: U+0A80 to U+0AFF
 */
export function isGujaratiChar(char: string): boolean {
  const code = char.charCodeAt(0);
  // Gujarati Unicode range: U+0A80 to U+0AFF
  // Also allow common punctuation and numbers
  return (
    (code >= 0x0a80 && code <= 0x0aff) || // Gujarati characters
    (code >= 0x0964 && code <= 0x0965) || // Devanagari danda (punctuation)
    (code >= 0x0020 && code <= 0x002f) || // Basic punctuation
    (code >= 0x0030 && code <= 0x0039) || // Numbers 0-9
    (code >= 0x003a && code <= 0x0040) || // More punctuation
    (code >= 0x005b && code <= 0x0060) || // More punctuation
    (code >= 0x007b && code <= 0x007e) || // More punctuation
    code === 0x200c || // Zero width non-joiner
    code === 0x200d || // Zero width joiner
    code === 0x0020 || // Space
    code === 0x0009 || // Tab
    code === 0x000a || // Newline
    code === 0x000d   // Carriage return
  );
}

/**
 * Validates if text contains only Gujarati characters (and allowed punctuation/numbers)
 */
export function isValidGujaratiText(text: string): boolean {
  if (!text) return true; // Empty is valid
  for (let i = 0; i < text.length; i++) {
    if (!isGujaratiChar(text[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Filters out non-Gujarati characters from text
 */
export function filterGujaratiOnly(text: string): string {
  return text
    .split('')
    .filter((char) => isGujaratiChar(char))
    .join('');
}

/**
 * Event handler to prevent non-Gujarati input
 */
export function handleGujaratiInput(
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
): void {
  // Allow special keys (backspace, delete, arrow keys, etc.)
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Tab',
    'Enter',
    'Escape',
    'Meta',
    'Control',
    'Alt',
    'Shift',
    'CapsLock',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
  ];

  if (allowedKeys.includes(e.key)) {
    return;
  }

  // Allow Ctrl/Cmd + A, C, V, X, Z (copy, paste, cut, undo, select all)
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
    return;
  }

  // Check if the key is a Gujarati character
  if (!isGujaratiChar(e.key)) {
    e.preventDefault();
  }
}

/** Gujarati digit characters (U+0AE6 to U+0AEF) */
const GUJARATI_DIGITS = '૦૧૨૩૪૫૬૭૮૯';
const ENGLISH_DIGITS = '0123456789';

/** Convert English digits (0-9) to Gujarati digits (૦-૯) */
export function toGujaratiDigits(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => {
      const i = ENGLISH_DIGITS.indexOf(char);
      return i >= 0 ? GUJARATI_DIGITS[i] : char;
    })
    .join('');
}

/** Convert Gujarati digits (૦-૯) to English digits (0-9). Leaves other chars unchanged. */
export function toEnglishDigits(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => {
      const i = GUJARATI_DIGITS.indexOf(char);
      return i >= 0 ? ENGLISH_DIGITS[i] : char;
    })
    .join('');
}

/** Normalize Aadhar input: allow only digits, return English digits string (max 12). */
export function normalizeAadharInput(value: string): string {
  const english = toEnglishDigits(value).replace(/\D/g, '');
  return english.slice(0, 12);
}

/** Allow only English digits (0-9) and control keys in Aadhar field */
export function handleAadharKeyDown(
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
): void {
  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'Tab', 'Enter', 'Escape', 'Meta', 'Control', 'Alt', 'Shift',
  ];
  if (allowedKeys.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
}

/**
 * Event handler for paste events - filters non-Gujarati characters
 */
export function handleGujaratiPaste(
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>
): void {
  const pastedText = e.clipboardData.getData('text');
  const filteredText = filterGujaratiOnly(pastedText);
  
  if (pastedText !== filteredText) {
    e.preventDefault();
    const target = e.currentTarget;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;
    const newValue = currentValue.slice(0, start) + filteredText + currentValue.slice(end);
    
    // Update the input value
    target.value = newValue;
    
    // Trigger onChange event manually
    const event = new Event('input', { bubbles: true });
    target.dispatchEvent(event);
    
    // Set cursor position
    setTimeout(() => {
      target.setSelectionRange(start + filteredText.length, start + filteredText.length);
    }, 0);
  }
}

