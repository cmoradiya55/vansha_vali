import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { setupGujaratiFont, setupGujaratiFontSync, encodeGujaratiText } from './gujaratiFontLoader';
import { loadGujaratiFontFromFile } from './loadGujaratiFont';
import { renderGujaratiTextAsImage } from './gujaratiTextRenderer';

// Gujarati font support - Using multiple libraries for best results
// html2canvas for complex Gujarati text rendering with proper fonts
// jsPDF for structure and layout

interface FormData {
  [key: string]: any;
}

// Helper function to split Gujarati text respecting word boundaries
const splitGujaratiText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  // Strategy: Split by spaces first, only break words if absolutely necessary
  // Split text into words (preserving spaces)
  const parts = text.split(/(\s+)/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Skip empty parts
    if (!part) continue;
    
    // Test if adding this part fits
    const testLine = currentLine + part;
    
    try {
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth <= maxWidth) {
        // Fits, add to current line
        currentLine = testLine;
      } else {
        // Doesn't fit
        if (currentLine.trim()) {
          // Save current line
          lines.push(currentLine.trim());
        }
        
        // Check if the part itself fits
        const partWidth = doc.getTextWidth(part.trim());
        if (partWidth <= maxWidth) {
          currentLine = part;
        } else {
          // Part is too long, need to break it
          // Use jsPDF's splitTextToSize as fallback for very long words
          const brokenParts = doc.splitTextToSize(part.trim(), maxWidth);
          if (brokenParts.length > 0) {
            // Add all but the last
            for (let j = 0; j < brokenParts.length - 1; j++) {
              lines.push(brokenParts[j]);
            }
            currentLine = brokenParts[brokenParts.length - 1] || '';
          } else {
            currentLine = part;
          }
        }
      }
    } catch (e) {
      // If getTextWidth fails, fall back to jsPDF's built-in method
      // but try to preserve word boundaries first
      const words = text.split(/\s+/);
      const wordLines: string[] = [];
      let wordLine = '';
      
      for (const word of words) {
        const testWordLine = wordLine ? wordLine + ' ' + word : word;
        try {
          const testLines = doc.splitTextToSize(testWordLine, maxWidth);
          if (testLines.length === 1) {
            wordLine = testWordLine;
          } else {
            if (wordLine) wordLines.push(wordLine);
            wordLine = word;
          }
        } catch {
          // Ultimate fallback
          return doc.splitTextToSize(text, maxWidth);
        }
      }
      if (wordLine) wordLines.push(wordLine);
      return wordLines.length > 0 ? wordLines : [text];
    }
  }

  // Add remaining line
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.length > 0 ? lines : [text];
};

// Helper function to add Gujarati text with proper font rendering
const addGujaratiText = async (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    useImageRendering?: boolean;
  }
): Promise<number> => {
  const fontSize = options?.fontSize || 10;
  const align = options?.align || 'left';
  const maxWidth = options?.maxWidth;
  // Use image rendering by default for proper Gujarati font support
  const useImageRendering = options?.useImageRendering !== false;

  // Use html2canvas to render with proper Gujarati fonts (works immediately)
  if (useImageRendering && typeof window !== 'undefined') {
    try {
      // Convert inches to pixels (96 DPI for screen)
      const fontSizePx = (fontSize / 72) * 96; // Convert points to pixels
      const maxWidthPx = maxWidth ? maxWidth * 96 : undefined;

      // Render text as image with proper Gujarati font
      const imageData = await renderGujaratiTextAsImage({
        text: encodeGujaratiText(text),
        fontSize: fontSizePx,
        maxWidth: maxWidthPx,
        align,
      });

      // Get image dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageData;
      });

      // Convert pixels to inches for PDF (96 DPI to 72 DPI conversion)
      // Use actual dimensions to prevent cutting
      const imgWidthInches = img.width / 96;
      const imgHeightInches = img.height / 96;

      // Add image to PDF with proper positioning
      // Use 'SLOW' compression for better quality, or 'MEDIUM' for balance
      doc.addImage(imageData, 'PNG', x, y, imgWidthInches, imgHeightInches, undefined, 'MEDIUM');

      return imgHeightInches;
    } catch (error) {
      console.warn('Failed to render Gujarati text as image, falling back to text:', error);
      // Fall through to text rendering
    }
  }

  // Fallback to text rendering (for server-side or if image rendering fails)
  doc.setFontSize(fontSize);
  const encodedText = encodeGujaratiText(text);

  // For Gujarati text, use custom word-wrapping that respects word boundaries
  if (maxWidth) {
    // Convert maxWidth from inches to points (72 points per inch)
    const maxWidthPoints = maxWidth * 72;
    const lines = splitGujaratiText(doc, encodedText, maxWidthPoints);
    doc.text(lines, x, y, { align });
    return lines.length * (fontSize / 72) * 1.3;
  } else {
    doc.text(encodedText, x, y, { align });
    return fontSize / 72 * 1.3;
  }
};

// Helper function to add image to PDF
const addImageToPDF = async (
  doc: jsPDF,
  imageData: string,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  if (imageData && imageData.startsWith('data:image')) {
    try {
      doc.addImage(imageData, 'JPEG', x, y, width, height);
      return true;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      return false;
    }
  }
  return false;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

export async function generatePDF(formData: FormData, isMaran: boolean = false) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'legal', // Legal size: 8.5 x 14 inches
    compress: true,
  });

  // Note: We use html2canvas for Gujarati text rendering, so we don't need to load fonts into jsPDF
  // The browser's Noto Sans Gujarati font will be used automatically via html2canvas
  setupGujaratiFontSync(doc);

  const pageWidth = 14; // Legal landscape width
  const pageHeight = 8.5; // Legal landscape height
  const margin = 0.5;
  const contentWidth = pageWidth - 2 * margin;
  const maxY = pageHeight - margin;

  let yPosition = margin + 0.2;

  // Helper function to check if new page needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > maxY) {
      doc.addPage();
      yPosition = margin + 0.2;
      return true;
    }
    return false;
  };

  // ========== PAGE 1 ==========
  
  // Header - Location
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  yPosition += await addGujaratiText(doc, formData.moje || 'કીમ/કઠોદરા', margin, yPosition, { fontSize: 10 });
  yPosition += 0.25;

  // Title
  doc.setFontSize(16);
  yPosition += await addGujaratiText(doc, isMaran ? 'મરણ' : 'હયાતી', margin, yPosition, { fontSize: 16 });
  yPosition += 0.3;

  // Reference
  doc.setFontSize(7);
  const referenceText =
    'ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/જ. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું';
  const refHeight = await addGujaratiText(doc, referenceText, margin, yPosition, { fontSize: 7, maxWidth: contentWidth });
  yPosition += refHeight + 0.25;

  // Location fields
  checkNewPage(0.5);
  yPosition += await addGujaratiText(doc, `મોજે: ${formData.moje || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.15;
  yPosition += await addGujaratiText(doc, `તાલુકો: ${formData.taluko || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.15;
  yPosition += await addGujaratiText(doc, `જીલ્લો: ${formData.jillo || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.25;

  // Applicant section (for Maran)
  if (isMaran) {
    checkNewPage(0.8);
    doc.setFontSize(10);
    // Font is handled by html2canvas, no need to set here
    const appHeaderHeight = await addGujaratiText(doc, 'અરજદારોનો જવાબ', margin, yPosition, { fontSize: 10 });
    yPosition += appHeaderHeight + 0.2;

    doc.setFontSize(8);
    const applicantName = formData.applicantName || '_________________';
    const applicantResident = formData.applicantResident || '_________________';
    const applicantTaluko = formData.applicantTaluko || '_________________';
    const applicantJillo = formData.applicantJillo || formData.jillo || '_________________';
    
    const applicantText = `હું નીચે સહી કરનાર ${applicantName} રહેવાસી ${applicantResident} તાલુકો ${applicantTaluko} જીલ્લો ${applicantJillo} આજ રોજ રૂબરૂ હાજર થઇ પુછવાની લખાવું છું કે,`;
    const appHeight = await addGujaratiText(doc, applicantText, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += appHeight + 0.15;

    const relationToDeceased = formData.relationToDeceased || '_________________';
    const deceasedRelation = formData.deceasedRelation || '_________________';
    const applicationDate = formatDate(formData.applicationDate || formData.pedhinamuDate || '');
    
    const relationText = `કે જેઓ મારા ${relationToDeceased} થાય તેઓનું ${deceasedRelation} હોઇ પેઢીનામું મેળવવા માટે તા ${applicationDate} ના રોજ અરજી કરેલી છે. તે સંદર્ભે આજ રોજ લખાવું છૂ કે, ગુજરનારના વારસદારો જાહેર કરતું પૈઢીનામું નીચે પ્રમાણે છે, જે હકીક્ત છે.`;
    const relHeight = await addGujaratiText(doc, relationText, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += relHeight + 0.15;

    checkNewPage(0.4);
    const deathPlace = formData.deathPlace || '_________________';
    const deathDate = formatDate(formData.deathDate || '');
    
    yPosition += await addGujaratiText(doc, `મુકામે: ${deathPlace}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.12;
    yPosition += await addGujaratiText(doc, `તારીખ: ${deathDate}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.15;
    
    const deathText = 'ના રોજ અવસાન થયેલું છે.';
    yPosition += await addGujaratiText(doc, deathText, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.15;

    const purpose = formData.pedhinamuPurpose || '_________________';
    const purposeText = `ના કામે તેમના પેઢીનામાની જરૂર ${purpose}`;
    yPosition += await addGujaratiText(doc, purposeText, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.25;
  }

  // Family Tree section
  checkNewPage(0.5);
  doc.setFontSize(10);
  // Font is handled by html2canvas, no need to set here
  const treeHeaderHeight = await addGujaratiText(doc, 'પેઢીનામું', margin, yPosition, { fontSize: 10 });
  yPosition += treeHeaderHeight + 0.2;

  // Add family tree data
  doc.setFontSize(8);
  // Font is handled by html2canvas, no need to set here
  if (formData.familyTree && Array.isArray(formData.familyTree) && formData.familyTree.length > 0) {
    for (let index = 0; index < formData.familyTree.length; index++) {
      const member = formData.familyTree[index];
      checkNewPage(0.3);
      let memberText = '';
      if (isMaran) {
        const birth = member.birth ? formatDate(member.birth) : '_________________';
        let death = '_________________';
        if (member.deathDateType === 'aashre' && member.deathAashre) {
          death = member.deathAashre;
        } else if (member.death) {
          death = formatDate(member.death);
        }
        memberText = `${index + 1}. નામ: ${member.name || '_________________'} | સબંધ: ${member.relation || '_________________'} | જન્મ: ${birth} | મરણ: ${death}`;
      } else {
        memberText = `${index + 1}. નામ: ${member.name || '_________________'} | સબંધ: ${member.relation || '_________________'} | ઉમર: ${member.age || '_________________'}`;
      }
      const memberHeight = await addGujaratiText(doc, memberText, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
      yPosition += memberHeight + 0.1;
    }
  } else {
    yPosition += await addGujaratiText(doc, '(કોઈ સભ્ય ઉમેરાયેલ નથી)', margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.2;
  }

  yPosition += 0.2;

  // Declaration text
  checkNewPage(0.6);
  doc.setFontSize(7);
  let declarationText = '';
  if (isMaran) {
    declarationText = 'આ પ્રમાણેનું પેઢીનામું અમે આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ...ના રોજ નેટરી શ્રી...ના કામે ઉપયોગ કરી શકાશે. આ પેઢીનામું વારસદારોનું પ્રમાણપત્ર અથવા પ્રોબેટ નથી. આ માત્ર પંચના રૂબરૂ જવાબ પર આધારિત છે. વારસદારોના દસ્તાવેજોની તપાસ જરૂરી છે. કોઈ પણ વિવાદ થાય તો કોર્ટનું વારસદાર પ્રમાણપત્ર અંતિમ માન્ય રહેશે.';
  } else {
    const applicantNameText = formData.applicantName || '_________________';
    const applicantDate = formatDate(formData.applicantDate || '');
    const applicantDistrict = formData.applicantDistrict || '_________________';
    const applicantResidentText = formData.applicantResident || '_________________';
    const pedhinamuDate = formatDate(formData.pedhinamuDate || '');
    
    declarationText = `હું નીચે સહિ કરનાર (અરજદાર) આજરોજ તલાટી કમ મંત્રી રૂબરૂ હાજર થઈ પૂછવાથી લખાવું છે કે હું પોતે ${applicantNameText} તા. ${applicantDate} જિ. ${applicantDistrict} રહેવાસી ${applicantResidentText} હયાત છું અને આ પેઢીનામુંના કામે જરૂર હોય પેઢીનામું મેળવવા માટે, તારીખ ${pedhinamuDate} ના રોજ અમોએ અરજી કરેલી છે, તે અરજી અન્વયે આજરોજ પંચો રૂબરૂ હાજર રહિ લખાવું છે કે, મારા સીધીલીટી ના ઉપરોકત દર્શાવ્યા સિવાયના અન્ય કોઈ વારસદરો બાકી રહેતા નથી. તેમ છતા ભવિષ્યમાં કોઈ વારસદરો નિકળે તો તેની તમામ જવાબદારી મારી પોતાની રહેશે.`;
  }
  const declHeight = await addGujaratiText(doc, declarationText, margin, yPosition, { fontSize: 7, maxWidth: contentWidth });
  yPosition += declHeight + 0.2;

  // Signatures
  checkNewPage(1.0);
  const place = formData.place || '_________________';
  const date = formatDate(formData.date || '');
  
  yPosition += await addGujaratiText(doc, `સ્થળ: ${place}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.12;
  yPosition += await addGujaratiText(doc, `તારીખ: ${date}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.2;

  // Panch signatures
  doc.setFontSize(8);
  await addGujaratiText(doc, 'પંચો ની સહી:', margin, yPosition, { fontSize: 8 });
  yPosition += 0.15;
  const sigCount = isMaran ? 5 : 3;
  const sigWidth = contentWidth / sigCount;
  for (let i = 1; i <= sigCount; i++) {
    const sigText = `${i}. ${formData.panchSignatures?.[i - 1] || '_________________'}`;
    await addGujaratiText(doc, sigText, margin + (i - 1) * sigWidth, yPosition, { fontSize: 8, maxWidth: sigWidth - 0.1 });
  }
  yPosition += 0.2;

  // Applicant photo (if available) - Add photo before signatures
  if (formData.preparerPhoto || formData.panchPhoto) {
    checkNewPage(1.2);
    const photoX = pageWidth - margin - 1.2;
    const photoY = yPosition - 0.3;
    await addImageToPDF(doc, formData.preparerPhoto || formData.panchPhoto, photoX, photoY, 1.0, 1.2);
  }

  yPosition += await addGujaratiText(doc, `લખાવનારની સહી: ${formData.declarantSignature || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.15;
  yPosition += await addGujaratiText(doc, `અંગુઠાનું નિશાન: ${formData.thumbImpression || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.15;
  yPosition += await addGujaratiText(doc, `આધાર કાડે નંબર: ${formData.aadharNumber || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });

  // ========== PAGE 2 ==========
  doc.addPage();
  yPosition = margin + 0.2;

  // Split heading
  doc.setFontSize(9);
  // Font is handled by html2canvas, no need to set here
  const splitHeading =
    'ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/જ. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું અંગેનું રૂબરૂ પંચનો જવાબ';
  const splitHeight = await addGujaratiText(doc, splitHeading, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += splitHeight + 0.25;

  // Panch response section
  doc.setFontSize(8);
  // Font is handled by html2canvas, no need to set here
  checkNewPage(0.5);
  const panchMoje = formData.panchMoje || formData.moje || '_________________';
  const panchTaluko = formData.panchTaluko || formData.taluko || '_________________';
  const panchJillo = formData.panchJillo || formData.jillo || '_________________';
  
  yPosition += await addGujaratiText(doc, `મોજે: ${panchMoje}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
  yPosition += 0.12;
  yPosition += await addGujaratiText(doc, `તાલુકો: ${panchTaluko}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
  yPosition += 0.12;
  yPosition += await addGujaratiText(doc, `જીલ્લો: ${panchJillo}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
  yPosition += 0.25;

  // Panch details table (for Maran)
  if (isMaran && formData.panchDetails && Array.isArray(formData.panchDetails)) {
    checkNewPage(1.0);
    doc.setFontSize(8);
    // Font is handled by html2canvas, no need to set here
    
    // Table header
    const tableData = formData.panchDetails.slice(0, 4).map((panch: any) => [
      panch.relation || '_________________',
      panch.resident || '_________________',
      panch.dhl || '_________________'
    ]);

    autoTable(doc, {
      head: [['સબંધ', 'રહેવાસી', 'ડી.એચ.એલ.']],
      body: tableData,
      startY: yPosition,
      margin: { left: margin * 72, right: margin * 72 },
      styles: { fontSize: 7, font: 'helvetica' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 2 * 72 },
        1: { cellWidth: 4 * 72 },
        2: { cellWidth: 2 * 72 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY / 72 + 0.15;

    checkNewPage(0.4);
    const existing = formData.existing || formData.hayatCount || '_________________';
    const totalDeaths = formData.totalDeaths || formData.maranCount || '_________________';
    
    yPosition += await addGujaratiText(doc, `હયાત: ${existing}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.12;
    yPosition += await addGujaratiText(doc, `મરણ એમ કુલ: ${totalDeaths}`, margin, yPosition, { fontSize: 8, maxWidth: contentWidth });
    yPosition += 0.2;
  }

  // Panch details (for both forms)
  if (formData.panchDetails && Array.isArray(formData.panchDetails)) {
    for (let index = 0; index < formData.panchDetails.length; index++) {
      const panch = formData.panchDetails[index];
      checkNewPage(1.2);
      doc.setFontSize(8);
      // Font is handled by html2canvas, no need to set here
      await addGujaratiText(doc, `પંચ-${index + 1}:`, margin, yPosition, { fontSize: 8 });
      yPosition += 0.15;
      // Font is handled by html2canvas, no need to set here
      
      yPosition += await addGujaratiText(doc, `નામ: ${panch.name || '_________________'}`, margin + 0.2, yPosition, { fontSize: 8, maxWidth: contentWidth - 0.2 });
      yPosition += 0.1;
      if (!isMaran) {
        yPosition += await addGujaratiText(doc, `ઉમર: ${panch.age || '_________________'}`, margin + 0.2, yPosition, { fontSize: 8, maxWidth: contentWidth - 0.2 });
        yPosition += 0.1;
      }
      yPosition += await addGujaratiText(doc, `રહેવાસી: ${panch.resident || '_________________'}`, margin + 0.2, yPosition, { fontSize: 8, maxWidth: contentWidth - 0.2 });
      yPosition += 0.1;
      yPosition += await addGujaratiText(doc, `આધારકાર્ડ નં.: ${panch.aadhar || '_________________'}`, margin + 0.2, yPosition, { fontSize: 8, maxWidth: contentWidth - 0.2 });
      
      // Add panch photo and thumb impression if available
      if (formData.panchPhotos && formData.panchPhotos[index]) {
        checkNewPage(1.2);
        const photoX = pageWidth - margin - 1.2;
        const photoY = yPosition - 0.5;
        await addImageToPDF(doc, formData.panchPhotos[index], photoX, photoY, 1.0, 1.2);
      }
      
      // Add thumb impression text if available
      if (formData.panchThumbImpressions && formData.panchThumbImpressions[index]) {
        yPosition += await addGujaratiText(doc, `અંગુઠાનું નિશાન: ${formData.panchThumbImpressions[index]}`, margin + 0.2, yPosition, { fontSize: 8, maxWidth: contentWidth - 0.2 });
        yPosition += 0.1;
      }
      
      yPosition += 0.2;
    }
  }

  // Panch declaration
  checkNewPage(0.8);
  doc.setFontSize(7);
  const hayatCount = formData.hayatCount || '0';
  const maranCount = formData.maranCount || '0';
  const totalHeirs = formData.totalHeirs || String(parseInt(hayatCount) + parseInt(maranCount));
  
  const panchDeclText =
    `અમે પંચ આ કામના અરજદાર અને તેમના પરિવારને સારી રીતે જાણીએ છીએ. અરજદારે જે પેઢીનામું આપ્યું છે તે સાચું અને ખરું છે. કુલ ${totalHeirs} વારસદાર છે (હયાત: ${hayatCount}, મરણ: ${maranCount}). કોઈ પણ કાનૂની વારસદાર છુટી ગયા નથી. ખોટું પેઢીનામું બનાવવું ફોજદારી ગુનો છે. વારસદારોના દસ્તાવેજોની તપાસ જરૂરી છે. જો કોઈ હકીકત છુપાવવામાં આવે તો પેઢીનામું રદ થશે.`;
  const panchDeclHeight = await addGujaratiText(doc, panchDeclText, margin, yPosition, { fontSize: 7, maxWidth: contentWidth });
  yPosition += panchDeclHeight + 0.2;

  // Final signatures
  checkNewPage(0.8);
  const finalPlace = formData.finalPlace || formData.place || '_________________';
  const finalDate = formatDate(formData.finalDate || formData.date || '');
  
  yPosition += await addGujaratiText(doc, `સ્થળ: ${finalPlace}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.12;
  yPosition += await addGujaratiText(doc, `તારીખ: ${finalDate}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.2;

  // Final section
  doc.setFontSize(7);
  const notaryName = formData.notaryName || '_________________';
  const regNo = formData.regNo || '_________________';
  const serialNo = formData.serialNo || '_________________';
  const notaryDate = formatDate(formData.notaryDate || '');
  
  const finalText = `આ પ્રમાણેનું પેઢીનામું અમે આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ ${notaryDate} ના રોજ નેટરી શ્રી ${notaryName} રજી નં. ${regNo} ના સિ.નં. ${serialNo} ના કામે ઉપયોગ કરી શકાશે.`;
  yPosition += await addGujaratiText(doc, finalText, margin, yPosition, { fontSize: 7, maxWidth: contentWidth });
  yPosition += 0.15;

  const finalNote =
    'આ પેઢીનામું વારસદારોનું પ્રમાણપત્ર અથવા પ્રોબેટ નથી. આ માત્ર પંચના રૂબરૂ જવાબ પર આધારિત છે. વારસદારોના દસ્તાવેજોની તપાસ જરૂરી છે. કોઈ પણ વિવાદ થાય તો કોર્ટનું વારસદાર પ્રમાણપત્ર અંતિમ માન્ય રહેશે. શ્રી કરેલ સોગંદનામું/સ્વધોષણા તથા પંચોના લખાવ્યા મુજબ તૈયાર કરેલ છે વારસદારોની ખોટા ખરા અંગે સબંધિત તલાટી કમ મંત્રીશ્રી જવાબદાર નથી.';
  checkNewPage(0.5);
  await addGujaratiText(doc, finalNote, margin, yPosition, { fontSize: 7, maxWidth: contentWidth });

  yPosition += 0.3;
  checkNewPage(0.4);
  const pedhinamuPurposeFinal = formData.pedhinamuPurposeFinal || formData.pedhinamuPurpose || '_________________';
  yPosition += await addGujaratiText(doc, `આ પેઢીનામું ${pedhinamuPurposeFinal} ના કામે ઉપયોગ કરી શકાશે.`, margin, yPosition, { fontSize: 7, maxWidth: contentWidth });
  yPosition += 0.2;
  
  yPosition += await addGujaratiText(doc, `અરજદાર ની સહિ: ${formData.applicantSignature || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });
  yPosition += 0.12;
  yPosition += await addGujaratiText(doc, `રૂબરૂ: ${formData.inPerson || '_________________'}`, margin, yPosition, { fontSize: 9, maxWidth: contentWidth });

  // Save PDF
  doc.save(`${isMaran ? 'maran' : 'hayati'}_pedhinamu.pdf`);
}

