// // Gujarati Text Renderer using html2canvas
// // This renders Gujarati text with proper browser fonts and converts to images for PDF

// import html2canvas from 'html2canvas';

// interface RenderTextOptions {
//   text: string;
//   fontSize: number; // in pixels
//   maxWidth?: number; // in pixels
//   align?: 'left' | 'center' | 'right';
//   fontFamily?: string;
//   color?: string;
//   lineHeight?: number;
// }

// /**
//  * Renders Gujarati text as an image using browser fonts
//  * This ensures proper Gujarati rendering with Noto Sans Gujarati font
//  */
// export async function renderGujaratiTextAsImage(
//   options: RenderTextOptions
// ): Promise<string> {
//   const {
//     text,
//     fontSize = 12,
//     maxWidth,
//     align = 'left',
//     fontFamily = "'Noto Sans Gujarati', 'Arial', sans-serif",
//     color = '#000000',
//     lineHeight = 1.3,
//   } = options;

//   // Create a temporary container element
//   const container = document.createElement('div');
//   container.style.position = 'absolute';
//   container.style.left = '-9999px';
//   container.style.top = '-9999px';
//   container.style.width = maxWidth ? `${maxWidth}px` : 'auto';
//   container.style.maxWidth = maxWidth ? `${maxWidth}px` : 'none';
//   container.style.minWidth = '10px'; // Minimum width
//   container.style.fontFamily = fontFamily;
//   container.style.fontSize = `${fontSize}px`;
//   container.style.color = color;
//   container.style.lineHeight = `${lineHeight}`;
//   container.style.textAlign = align;
//   container.style.whiteSpace = maxWidth ? 'pre-wrap' : 'nowrap'; // pre-wrap preserves spaces and wraps
//   container.style.wordWrap = 'break-word';
//   container.style.overflowWrap = 'break-word';
//   container.style.overflow = 'visible'; // Ensure text is not clipped
//   container.style.padding = '15px 10px'; // More padding to prevent cutting (top/bottom, left/right)
//   container.style.margin = '0';
//   container.style.backgroundColor = 'white';
//   container.style.boxSizing = 'content-box'; // Padding adds to width
//   container.style.display = 'inline-block'; // Better text wrapping
//   container.style.verticalAlign = 'top';
//   container.style.fontFeatureSettings = 'normal'; // Ensure proper font rendering
//   container.style.textRendering = 'optimizeLegibility'; // Better text rendering
//   container.style.letterSpacing = 'normal'; // Normal letter spacing for Gujarati
//   container.style.wordSpacing = 'normal'; // Normal word spacing
//   container.textContent = text;

//   // Append to body temporarily
//   document.body.appendChild(container);

//   // Force a reflow to ensure dimensions are calculated and fonts are loaded
//   const height = container.offsetHeight;
//   const width = container.offsetWidth;
  
//   // Wait a bit more for fonts to fully render
//   await new Promise(resolve => setTimeout(resolve, 100));

//   try {
//     // Ensure container has proper dimensions before rendering
//     // Add extra space to prevent cutting
//     if (maxWidth) {
//       container.style.width = `${Math.max(container.scrollWidth, width) + 20}px`;
//     }
//     container.style.height = 'auto';
//     container.style.minHeight = `${Math.max(container.scrollHeight, height) + 20}px`;
    
//     // Force another reflow
//     container.offsetHeight;
    
//     // Render to canvas with proper options
//     const canvas = await html2canvas(container, {
//       useCORS: true,
//       logging: false,
//       allowTaint: false,
//     });

//     // Get image data with high quality
//     const imageData = canvas.toDataURL('image/png', 1.0); // Maximum quality

//     // Clean up
//     document.body.removeChild(container);

//     return imageData;
//   } catch (error) {
//     // Clean up on error
//     if (container.parentNode) {
//       document.body.removeChild(container);
//     }
//     console.error('Error rendering Gujarati text:', error);
//     throw error;
//   }
// }

// /**
//  * Renders multiple lines of Gujarati text
//  */
// export async function renderGujaratiTextLines(
//   lines: string[],
//   options: Omit<RenderTextOptions, 'text'>
// ): Promise<string> {
//   const text = lines.join('\n');
//   return renderGujaratiTextAsImage({ ...options, text });
// }

