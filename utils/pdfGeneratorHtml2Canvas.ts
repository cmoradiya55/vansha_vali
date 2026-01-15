import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from HTML element using html2canvas and jsPDF
 * This preserves the exact visual appearance of the form including fonts, styling, and layout
 */
export async function generatePDFFromHTML(
  elementId: string,
  filename: string = 'pedhinamu.pdf',
  options?: {
    format?: 'a4' | 'legal' | [number, number];
    orientation?: 'portrait' | 'landscape';
    quality?: number;
    scale?: number;
  }
) {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const {
    format = 'legal',
    orientation = 'landscape',
    quality = 1,
    scale = 2, // Higher scale for better quality
  } = options || {};

  let loadingElement: HTMLElement | null = null;
  
  try {
    // Wait a bit for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Scroll element into view to ensure it's fully rendered
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Show loading indicator
    loadingElement = document.createElement('div');
    loadingElement.id = 'pdf-loading';
    loadingElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-size: 20px;
    `;
    loadingElement.textContent = 'PDF બનાવી રહ્યા છીએ... (Generating PDF...)';
    document.body.appendChild(loadingElement);
    
    // ✅ THE REAL FIX: Clone element, remove stylesheets, apply computed styles as inline
    const cloneElementForPDF = (originalEl: HTMLElement): HTMLElement => {
      // Deep clone the element
      const clonedEl = originalEl.cloneNode(true) as HTMLElement;
      
      // Create a temporary container with no stylesheets
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = `${originalEl.scrollWidth}px`;
      tempContainer.style.height = `${originalEl.scrollHeight}px`;
      tempContainer.appendChild(clonedEl);
      document.body.appendChild(tempContainer);
      
      // Apply computed styles from original to clone as inline styles
      const applyComputedStyles = (original: HTMLElement, clone: HTMLElement) => {
        try {
          const computed = window.getComputedStyle(original);
          const cloneStyle = clone.style;
          
          // Copy all important visual styles
          cloneStyle.backgroundColor = computed.backgroundColor;
          cloneStyle.color = computed.color;
          cloneStyle.fontFamily = computed.fontFamily;
          cloneStyle.fontSize = computed.fontSize;
          cloneStyle.fontWeight = computed.fontWeight;
          cloneStyle.fontStyle = computed.fontStyle;
          cloneStyle.textAlign = computed.textAlign;
          cloneStyle.padding = computed.padding;
          cloneStyle.margin = computed.margin;
          cloneStyle.border = computed.border;
          cloneStyle.borderColor = computed.borderColor;
          cloneStyle.borderRadius = computed.borderRadius;
          cloneStyle.width = computed.width;
          cloneStyle.height = computed.height;
          cloneStyle.display = computed.display;
          cloneStyle.flexDirection = computed.flexDirection;
          cloneStyle.justifyContent = computed.justifyContent;
          cloneStyle.alignItems = computed.alignItems;
          cloneStyle.gap = computed.gap;
          cloneStyle.position = computed.position;
          cloneStyle.top = computed.top;
          cloneStyle.left = computed.left;
          cloneStyle.right = computed.right;
          cloneStyle.bottom = computed.bottom;
          cloneStyle.zIndex = computed.zIndex;
          cloneStyle.opacity = computed.opacity;
          cloneStyle.transform = computed.transform;
          cloneStyle.boxShadow = computed.boxShadow;
          
          // Recursively apply to children
          const originalChildren = Array.from(original.children);
          const cloneChildren = Array.from(clone.children);
          
          originalChildren.forEach((originalChild, index) => {
            if (originalChild instanceof HTMLElement && cloneChildren[index] instanceof HTMLElement) {
              applyComputedStyles(originalChild, cloneChildren[index] as HTMLElement);
            }
          });
        } catch (e) {
          console.warn('Error applying computed styles:', e);
        }
      };
      
      // Apply all computed styles as inline styles
      applyComputedStyles(originalEl, clonedEl);
      
      // Remove temp container and return clone
      document.body.removeChild(tempContainer);
      
      return clonedEl;
    };
    
    // Clone element with all styles as inline (no stylesheets)
    const clonedElement = cloneElementForPDF(element);
    
    // Mark clone for easy cleanup
    clonedElement.setAttribute('data-pdf-clone', elementId);
    
    // Temporarily append clone to body for html2canvas
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    document.body.appendChild(clonedElement);
    
    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ensure cloned element has valid dimensions
    const elementWidth = clonedElement.scrollWidth || clonedElement.clientWidth || element.scrollWidth || 800;
    const elementHeight = clonedElement.scrollHeight || clonedElement.clientHeight || element.scrollHeight || 600;
    
    if (elementWidth === 0 || elementHeight === 0) {
      // Clean up cloned element before throwing
      if (clonedElement && clonedElement.parentNode) {
        document.body.removeChild(clonedElement);
      }
      throw new Error('Element has zero dimensions. Make sure the element is visible.');
    }

    // Adjust scale if content is too large to prevent memory issues
    const maxCanvasSize = 16000; // Maximum canvas dimension
    const adjustedScale = Math.min(
      scale,
      Math.floor(maxCanvasSize / Math.max(elementWidth, elementHeight)),
      3
    );

    // Suppress console errors for lab() color parsing
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const suppressedErrors: string[] = [];
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('lab(') || message.includes('unsupported color function')) {
        suppressedErrors.push(message);
        return; // Suppress lab() color errors
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('lab(') || message.includes('unsupported color function')) {
        suppressedErrors.push(message);
        return; // Suppress lab() color warnings
      }
      originalConsoleWarn.apply(console, args);
    };

    // Configure html2canvas options with better error handling
    // Use cloned element (no stylesheets, only inline styles)
    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(clonedElement, {
        scale: adjustedScale as any,
        useCORS: true,
        allowTaint: false, // Prevent tainted canvas
        logging: false,
        backgroundColor: '#ffffff',
        width: elementWidth,
        height: elementHeight,
        windowWidth: elementWidth,
        windowHeight: elementHeight,
        removeContainer: true,
        ignoreElements: (_element: Element) => {
          // Ignore elements that might cause issues
          return false;
        },
        onclone: (clonedDoc: Document) => {
          // Remove all stylesheets from cloned document to prevent lab() parsing
          const stylesheets = Array.from(clonedDoc.styleSheets);
          stylesheets.forEach((sheet) => {
            try {
              if (sheet.ownerNode) {
                sheet.ownerNode.parentNode?.removeChild(sheet.ownerNode);
              }
            } catch (e) {
              // Ignore errors removing stylesheets
            }
          });
          
          // Also remove all <style> and <link> tags
          const styleTags = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styleTags.forEach((tag) => tag.remove());
          
          // Ensure fonts are loaded
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.fontFamily = el.style.fontFamily || 'Noto Sans Gujarati, Arial, sans-serif';
            }
          });
          
          // Fix any images that might have CORS issues
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img: HTMLImageElement) => {
            if (img.src && img.src.startsWith('data:')) {
              return;
            }
            img.crossOrigin = 'anonymous';
          });
        },
      } as any);
    } catch (canvasError: any) {
      // Check if it's a lab() color error
      const errorMessage = canvasError?.message || String(canvasError);
      if (errorMessage.includes('lab(') || errorMessage.includes('unsupported color function')) {
        // This shouldn't happen with cloned element, but if it does, try minimal options
        console.warn('Lab color error detected, retrying with minimal options...');
        try {
          canvas = await html2canvas(clonedElement, {
            useCORS: true,
            allowTaint: false,
            logging: false,
            ignoreElements: () => false,
          } as any);
        } catch (retryError) {
          // If still fails, throw the original error
          throw canvasError;
        }
      } else {
        // For other errors, try fallback
        console.warn('First attempt failed, trying with simpler options:', canvasError);
        canvas = await html2canvas(clonedElement, {
          useCORS: true,
          allowTaint: false,
          logging: false,
        } as any);
      }
    } finally {
      // Restore original console methods
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      
      // Clean up cloned element
      if (clonedElement && clonedElement.parentNode) {
        document.body.removeChild(clonedElement);
      }
    }

    // Remove loading indicator
    if (loadingElement && loadingElement.parentNode) {
      document.body.removeChild(loadingElement);
      loadingElement = null;
    }

    // Calculate PDF dimensions
    let pdfWidth: number;
    let pdfHeight: number;

    if (Array.isArray(format)) {
      pdfWidth = format[0];
      pdfHeight = format[1];
    } else if (format === 'legal') {
      if (orientation === 'landscape') {
        pdfWidth = 14; // inches
        pdfHeight = 8.5; // inches
      } else {
        pdfWidth = 8.5;
        pdfHeight = 14;
      }
    } else {
      // A4
      if (orientation === 'landscape') {
        pdfWidth = 11.69; // inches
        pdfHeight = 8.27;
      } else {
        pdfWidth = 8.27;
        pdfHeight = 11.69;
      }
    }

    // Convert inches to mm for jsPDF
    const pdfWidthMM = pdfWidth * 25.4;
    const pdfHeightMM = pdfHeight * 25.4;

    // Calculate image dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const imgAspectRatio = imgWidth / imgHeight;
    const pdfAspectRatio = pdfWidthMM / pdfHeightMM;

    let finalWidth: number;
    let finalHeight: number;

    if (imgAspectRatio > pdfAspectRatio) {
      // Image is wider - fit to width
      finalWidth = pdfWidthMM;
      finalHeight = pdfWidthMM / imgAspectRatio;
    } else {
      // Image is taller - fit to height
      finalHeight = pdfHeightMM;
      finalWidth = pdfHeightMM * imgAspectRatio;
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [pdfWidthMM, pdfHeightMM],
      compress: true,
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', quality);

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight, undefined, 'FAST');

    // If content is taller than one page, split into multiple pages
    if (finalHeight > pdfHeightMM) {
      const totalPages = Math.ceil(finalHeight / pdfHeightMM);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the image to show on this page
        const sourceY = (i * pdfHeightMM * imgHeight) / finalHeight;
        const pageHeight = Math.min(pdfHeightMM, finalHeight - (i * pdfHeightMM));
        const sourceHeight = (pageHeight * imgHeight) / finalHeight;
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          // Draw the slice of the original canvas
          pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', quality);
          pdf.addImage(pageImgData, 'PNG', 0, 0, finalWidth, pageHeight, undefined, 'FAST');
        }
      }
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up loading indicator if it exists
    if (loadingElement && loadingElement.parentNode) {
      try {
        document.body.removeChild(loadingElement);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Also try to remove by ID
    const existingLoader = document.getElementById('pdf-loading');
    if (existingLoader && existingLoader.parentNode) {
      try {
        document.body.removeChild(existingLoader);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF Generation Error Details:', errorMessage);
    
    alert(`PDF બનાવવામાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.\n\nError: ${errorMessage}\n\n(Error generating PDF. Please try again.)`);
  }
}

/**
 * Generate PDF with multiple pages support for long content
 */
export async function generatePDFFromHTMLMultiPage(
  elementId: string,
  filename: string = 'pedhinamu.pdf',
  options?: {
    format?: 'a4' | 'legal' | [number, number];
    orientation?: 'portrait' | 'landscape';
    quality?: number;
    scale?: number;
    pageBreak?: number; // Height in pixels to trigger page break
  }
) {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const {
    format = 'legal',
    orientation = 'landscape',
    quality = 1,
    scale = 2,
    pageBreak = 2000, // Default page break at 2000px
  } = options || {};

  let loadingElement: HTMLElement | null = null;

  try {
    // Wait a bit for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Scroll element into view to ensure it's fully rendered
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Show loading indicator
    loadingElement = document.createElement('div');
    loadingElement.id = 'pdf-loading';
    loadingElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-size: 20px;
    `;
    loadingElement.textContent = 'PDF બનાવી રહ્યા છીએ... (Generating PDF...)';
    document.body.appendChild(loadingElement);

    // Calculate PDF dimensions
    let pdfWidth: number;
    let pdfHeight: number;

    if (Array.isArray(format)) {
      pdfWidth = format[0];
      pdfHeight = format[1];
    } else if (format === 'legal') {
      if (orientation === 'landscape') {
        pdfWidth = 14;
        pdfHeight = 8.5;
      } else {
        pdfWidth = 8.5;
        pdfHeight = 14;
      }
    } else {
      if (orientation === 'landscape') {
        pdfWidth = 11.69;
        pdfHeight = 8.27;
      } else {
        pdfWidth = 8.27;
        pdfHeight = 11.69;
      }
    }

    const pdfWidthMM = pdfWidth * 25.4;
    const pdfHeightMM = pdfHeight * 25.4;

    // Split content into pages
    const totalHeight = element.scrollHeight;
    const pageHeightPx = (pdfHeightMM / 25.4) * 96; // Convert to pixels (96 DPI)
    const numPages = Math.ceil(totalHeight / pageHeightPx);

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [pdfWidthMM, pdfHeightMM],
      compress: true,
    });

    // Ensure element has valid dimensions
    const elementWidth = element.scrollWidth || element.clientWidth || 800;
    const elementHeight = element.scrollHeight || element.clientHeight || 600;
    
    if (elementWidth === 0 || elementHeight === 0) {
      throw new Error('Element has zero dimensions. Make sure the element is visible.');
    }

    // Suppress console errors for lab() color parsing
    const originalConsoleError = console.error;
    const suppressedErrors: string[] = [];
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('lab(') || message.includes('unsupported color function')) {
        suppressedErrors.push(message);
        return; // Suppress lab() color errors
      }
      originalConsoleError.apply(console, args);
    };

    // Capture each page
    for (let page = 0; page < numPages; page++) {
      const yOffset = page * pageHeightPx;
      const pageHeight = Math.min(pageHeightPx, totalHeight - yOffset);
      
      const canvas = await html2canvas(element, {
        scale: Math.min(scale, 3) as any, // Limit scale to prevent memory issues
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: elementWidth,
        height: pageHeight,
        windowWidth: elementWidth,
        windowHeight: pageHeight,
        y: yOffset,
        removeContainer: true,
        onclone: (clonedDoc: Document) => {
          // Fix lab() color function issue by converting computed styles from original element
          const fixLabColors = (originalEl: HTMLElement, clonedEl: HTMLElement) => {
            try {
              const computedStyle = window.getComputedStyle(originalEl);
              const clonedStyle = clonedEl.style;
              
              // Get RGB values from computed styles (browser converts lab() to rgb automatically)
              const bgColor = computedStyle.backgroundColor;
              if (bgColor && !bgColor.includes('rgba(0, 0, 0, 0)') && !bgColor.includes('transparent')) {
                clonedStyle.backgroundColor = bgColor;
              }
              
              const textColor = computedStyle.color;
              if (textColor) {
                clonedStyle.color = textColor;
              }
              
              const borderColor = computedStyle.borderColor;
              if (borderColor && borderColor !== 'rgb(0, 0, 0)') {
                clonedStyle.borderColor = borderColor;
              }
              
              // Recursively fix children by matching original and cloned elements
              const originalChildren = Array.from(originalEl.children);
              const clonedChildren = Array.from(clonedEl.children);
              
              originalChildren.forEach((originalChild, index) => {
                if (originalChild instanceof HTMLElement && clonedChildren[index] instanceof HTMLElement) {
                  fixLabColors(originalChild, clonedChildren[index] as HTMLElement);
                }
              });
            } catch (e) {
              // Silently ignore errors in color conversion
              console.warn('Error fixing lab colors:', e);
            }
          };
          
          const clonedElement = clonedDoc.getElementById(elementId);
          const originalElement = document.getElementById(elementId);
          
          if (clonedElement && originalElement) {
            clonedElement.style.fontFamily = 'Noto Sans Gujarati, Arial, sans-serif';
            clonedElement.style.transform = `translateY(-${yOffset}px)`;
            
            // Fix lab() colors by copying computed RGB values from original element
            fixLabColors(originalElement, clonedElement);
            
            // Fix any images that might have CORS issues
            const images = clonedElement.querySelectorAll('img');
            images.forEach((img: HTMLImageElement) => {
              if (img.src && img.src.startsWith('data:')) {
                return;
              }
              img.crossOrigin = 'anonymous';
            });
          }
        },
      } as any);

      const imgData = canvas.toDataURL('image/png', quality);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const imgAspectRatio = imgWidth / imgHeight;
      const pdfAspectRatio = pdfWidthMM / pdfHeightMM;

      let finalWidth: number;
      let finalHeight: number;

      if (imgAspectRatio > pdfAspectRatio) {
        finalWidth = pdfWidthMM;
        finalHeight = pdfWidthMM / imgAspectRatio;
      } else {
        finalHeight = pdfHeightMM;
        finalWidth = pdfHeightMM * imgAspectRatio;
      }

      if (page > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight, undefined, 'FAST');
    }

    // Restore original console.error
    console.error = originalConsoleError;

    // Remove loading indicator
    if (loadingElement && loadingElement.parentNode) {
      document.body.removeChild(loadingElement);
      loadingElement = null;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up loading indicator if it exists
    if (loadingElement && loadingElement.parentNode) {
      try {
        document.body.removeChild(loadingElement);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Also try to remove by ID
    const existingLoader = document.getElementById('pdf-loading');
    if (existingLoader && existingLoader.parentNode) {
      try {
        document.body.removeChild(existingLoader);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF Generation Error Details:', errorMessage);
    
    alert(`PDF બનાવવામાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.\n\nError: ${errorMessage}\n\n(Error generating PDF. Please try again.)`);
  }
}

