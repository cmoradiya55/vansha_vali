// Utility to load Gujarati font for jsPDF
// This file provides instructions and a helper to load Noto Sans Gujarati font

import jsPDF from 'jspdf';

/**
 * Loads Noto Sans Gujarati font into jsPDF
 * 
 * To use this properly:
 * 1. Download Noto Sans Gujarati font from: https://fonts.google.com/noto/specimen/Noto+Sans+Gujarati
 * 2. Place the TTF file in public/fonts/NotoSansGujarati-Regular.ttf
 * 3. Or convert it to base64 and use the loadFontFromBase64 function
 */

export async function loadGujaratiFontFromFile(doc: jsPDF, fontPath: string = '/fonts/NotoSansGujarati-Regular.ttf'): Promise<boolean> {
  // Note: We're using html2canvas for text rendering, so we don't need to load fonts into jsPDF
  // This function is kept for compatibility but returns false to use image rendering instead
  // The browser's Noto Sans Gujarati font (loaded from Google Fonts) will be used via html2canvas
  return false;
}

export function loadGujaratiFontFromBase64(doc: jsPDF, fontBase64: string): void {
  try {
    doc.addFileToVFS('NotoSansGujarati-Regular.ttf', fontBase64);
    doc.addFont('NotoSansGujarati-Regular.ttf', 'NotoSansGujarati', 'normal');
    doc.addFont('NotoSansGujarati-Regular.ttf', 'NotoSansGujarati', 'bold');
    doc.setFont('NotoSansGujarati', 'normal');
  } catch (error) {
    console.error('Error loading Gujarati font from base64:', error);
  }
}

