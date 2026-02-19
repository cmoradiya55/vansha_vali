// // Gujarati Font Loader for jsPDF
// // This utility loads and registers Gujarati fonts for proper PDF rendering

// import jsPDF from 'jspdf';

// // Font cache to avoid reloading
// let fontLoaded = false;
// let fontLoading = false;

// // Function to load Gujarati font from URL and register it with jsPDF
// async function loadGujaratiFont(doc: jsPDF): Promise<void> {
//   if (fontLoaded) {
//     doc.setFont('NotoSansGujarati', 'normal');
//     return;
//   }

//   if (fontLoading) {
//     // Wait for font to load
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     if (fontLoaded) {
//       doc.setFont('NotoSansGujarati', 'normal');
//       return;
//     }
//   }

//   fontLoading = true;

//   try {
//     // Try to load font from Google Fonts CDN
//     // Note: This requires the font to be available as a TTF file
//     // For production, you should download the font and include it in your project
    
//     // Alternative: Use a smaller approach - load font data
//     // For now, we'll use a workaround with better Unicode handling
    
//     // If you have the font file, uncomment and use this:
//     /*
//     const fontUrl = '/fonts/NotoSansGujarati-Regular.ttf';
//     const response = await fetch(fontUrl);
//     const fontArrayBuffer = await response.arrayBuffer();
//     const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontArrayBuffer)));
    
//     doc.addFileToVFS('NotoSansGujarati-Regular.ttf', fontBase64);
//     doc.addFont('NotoSansGujarati-Regular.ttf', 'NotoSansGujarati', 'normal');
//     doc.setFont('NotoSansGujarati', 'normal');
//     */
    
//     // For now, use improved Unicode support
//     // The browser's font rendering will help, but PDF may still have issues
//     doc.setFont('helvetica', 'normal');
    
//     fontLoaded = true;
//   } catch (error) {
//     console.warn('Failed to load Gujarati font, using default:', error);
//     doc.setFont('helvetica', 'normal');
//     fontLoaded = true; // Mark as loaded to avoid retrying
//   } finally {
//     fontLoading = false;
//   }
// }

// export async function setupGujaratiFont(doc: jsPDF): Promise<void> {
//   await loadGujaratiFont(doc);
// }

// // Synchronous version for immediate use
// export function setupGujaratiFontSync(doc: jsPDF): void {
//   // Use helvetica with Unicode support
//   // For proper Gujarati, you need to load a font file
//   doc.setFont('helvetica', 'normal');
// }

// // Helper to ensure Gujarati text is properly encoded
// export function encodeGujaratiText(text: string): string {
//   if (typeof text !== 'string') {
//     return String(text);
//   }
//   // Ensure proper Unicode encoding
//   return text;
// }
