import jsPDF from 'jspdf';

interface FormData {
  [key: string]: any;
}

export function generatePDF(formData: FormData, isMaran: boolean = false) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'legal', // Legal size: 8.5 x 14 inches
  });

  const pageWidth = 14; // Legal landscape width
  const pageHeight = 8.5; // Legal landscape height
  const margin = 0.5;
  const contentWidth = pageWidth - 2 * margin;
  const maxY = pageHeight - margin;

  let yPosition = margin + 0.2;

  // Helper function to add text with word wrap
  const addText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return lines.length * (fontSize / 72) * 1.3; // Return height used
  };

  // Helper function to check if new page needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > maxY) {
      doc.addPage();
      yPosition = margin + 0.2;
      return true;
    }
    return false;
  };

  // Helper function to add field
  const addField = (label: string, value: string, x: number, y: number, labelWidth: number = 1.5) => {
    const labelText = `${label}:`;
    const valueText = value || '_________________';
    const labelHeight = addText(labelText, x, y, labelWidth, 9);
    const valueHeight = addText(valueText, x + labelWidth + 0.1, y, contentWidth - labelWidth - 0.1, 9);
    return Math.max(labelHeight, valueHeight);
  };

  // ========== PAGE 1 ==========
  
  // Header
  doc.setFontSize(11);
  doc.setFont('Arial', 'bold');
  doc.text('Kim Kathodara', margin, yPosition);
  yPosition += 0.25;

  // Title
  doc.setFontSize(16);
  doc.text(isMaran ? 'મરણ' : 'હયાતી', margin, yPosition);
  yPosition += 0.3;

  // Reference
  doc.setFontSize(7);
  doc.setFont('Arial', 'normal');
  const referenceText =
    'ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/૪. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું';
  const refHeight = addText(referenceText, margin, yPosition, contentWidth, 7);
  yPosition += refHeight + 0.25;

  // Location fields
  checkNewPage(0.5);
  yPosition += addField('મોજે', formData.moje || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('તાલુકો', formData.taluko || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('જીલ્લો', formData.jillo || '', margin, yPosition);
  yPosition += 0.25;

  // Applicant section (for Maran)
  if (isMaran) {
    checkNewPage(0.8);
    doc.setFontSize(10);
    doc.setFont('Arial', 'bold');
    const appHeaderHeight = addText('અરજદારોનો જવાબ', margin, yPosition, contentWidth, 10);
    yPosition += appHeaderHeight + 0.2;

    doc.setFontSize(8);
    doc.setFont('Arial', 'normal');
    const applicantText = `હું નીચે સહી કરનાર ${formData.applicantName || '_________________'} રહેવાસી ${formData.applicantResident || '_________________'} તાલુકો ${formData.applicantTaluko || '_________________'} જીલ્લો ${formData.applicantJillo || '_________________'} આજ રોજ રૂબરૂ હાજર થઇ પુછવાની લખાવું છું કે,`;
    const appHeight = addText(applicantText, margin, yPosition, contentWidth, 8);
    yPosition += appHeight + 0.15;

    const relationText = `કે જેઓ મારા ${formData.relationToDeceased || '_________________'} થાય તેઓનું ${formData.deceasedRelation || '_________________'} હોઇ પેઢીનામું મેળવવા માટે તા ${formData.applicationDate || '______'} ના રોજ અરજી કરેલી છે. તે સંદર્ભે આજ રોજ લખાવું છૂ કે, ગુજરનારના વારસદારો જાહેર કરતું પૈઢીનામું નીચે પ્રમાણે છે, જે હકીક્ત છે.`;
    const relHeight = addText(relationText, margin, yPosition, contentWidth, 8);
    yPosition += relHeight + 0.15;

    checkNewPage(0.4);
    yPosition += addField('મુકામે', formData.deathPlace || '', margin, yPosition, 1.2);
    yPosition += 0.12;
    yPosition += addField('તારીખ', formData.deathDate || '', margin, yPosition, 1.2);
    yPosition += 0.15;
    
    const deathText = 'ના રોજ અવસાન થયેલું છે.';
    yPosition += addText(deathText, margin, yPosition, contentWidth, 8);
    yPosition += 0.15;

    const purposeText = `ના કામે તેમના પેઢીનામાની જરૂર ${formData.purpose || '_________________'}`;
    yPosition += addText(purposeText, margin, yPosition, contentWidth, 8);
    yPosition += 0.25;
  }

  // Family Tree section
  checkNewPage(0.5);
  doc.setFontSize(10);
  doc.setFont('Arial', 'bold');
  const treeHeaderHeight = addText('પેઢીનામું', margin, yPosition, contentWidth, 10);
  yPosition += treeHeaderHeight + 0.2;

  // Add family tree data
  doc.setFontSize(8);
  doc.setFont('Arial', 'normal');
  if (formData.familyTree && Array.isArray(formData.familyTree) && formData.familyTree.length > 0) {
    formData.familyTree.forEach((member: any, index: number) => {
      checkNewPage(0.3);
      let memberText = '';
      if (isMaran) {
        memberText = `${index + 1}. નામ: ${member.name || '_________________'} | સબંધ: ${member.relation || '_________________'} | જન્મ: ${member.birth || '_________________'} | મરણ: ${member.death || '_________________'}`;
      } else {
        memberText = `${index + 1}. નામ: ${member.name || '_________________'} | ઉમર: ${member.age || '_________________'}`;
      }
      const memberHeight = addText(memberText, margin, yPosition, contentWidth, 8);
      yPosition += memberHeight + 0.1;
    });
  } else {
    yPosition += addText('(કોઈ સભ્ય ઉમેરાયેલ નથી)', margin, yPosition, contentWidth, 8);
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
    declarationText = `હું નીચે સહિ કરનાર (અરજદાર) આજરોજ તલાટી કમ મંત્રી રૂબરૂ હાજર થઈ પૂછવાથી લખાવું છે કે હું પોતે ${applicantNameText} તા. ${formData.applicantDate || '______'} જિ. ${formData.applicantDistrict || '______'} રહેવાસી ${formData.applicantResident || '______'} હયાત છું અને આ પેઢીનામુંના કામે જરૂર હોય પેઢીનામું મેળવવા માટે, તારીખ ${formData.pedhinamuDate || '______'} ના રોજ અમોએ અરજી કરેલી છે, તે અરજી અન્વયે આજરોજ પંચો રૂબરૂ હાજર રહિ લખાવું છે કે, મારા સીધીલીટી ના ઉપરોકત દર્શાવ્યા સિવાયના અન્ય કોઈ વારસદરો બાકી રહેતા નથી. તેમ છતા ભવિષ્યમાં કોઈ વારસદરો નિકળે તો તેની તમામ જવાબદારી મારી પોતાની રહેશે.`;
  }
  const declHeight = addText(declarationText, margin, yPosition, contentWidth, 7);
  yPosition += declHeight + 0.2;

  // Signatures
  checkNewPage(1.0);
  yPosition += addField('સ્થળ', formData.place || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('તારીખ', formData.date || '', margin, yPosition);
  yPosition += 0.2;

  // Panch signatures
  doc.setFontSize(8);
  doc.text('પંચે ની સહી:', margin, yPosition);
  yPosition += 0.15;
  const sigCount = isMaran ? 5 : 3;
  const sigWidth = contentWidth / sigCount;
  for (let i = 1; i <= sigCount; i++) {
    const sigText = `${i}. ${formData.panchSignatures?.[i - 1] || '_________________'}`;
    addText(sigText, margin + (i - 1) * sigWidth, yPosition, sigWidth - 0.1, 8);
  }
  yPosition += 0.2;

  yPosition += addField('લખાવનારની સહી', formData.declarantSignature || '', margin, yPosition);
  yPosition += 0.15;
  yPosition += addField('અંગુઠાનું નિશાન', '', margin, yPosition);
  yPosition += 0.15;
  yPosition += addField('આધાર કાડે નંબર', formData.aadharNumber || '', margin, yPosition);

  // ========== PAGE 2 ==========
  // Split at the specified heading
  doc.addPage();
  yPosition = margin + 0.2;

  // Split heading - This is where page 2 starts
  doc.setFontSize(9);
  doc.setFont('Arial', 'bold');
  const splitHeading =
    'ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/૪. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું અંગેનું રૂબરૂ પંચનો જવાબ';
  const splitHeight = addText(splitHeading, margin, yPosition, contentWidth, 9);
  yPosition += splitHeight + 0.25;

  // Panch response section
  doc.setFontSize(8);
  doc.setFont('Arial', 'normal');
  checkNewPage(0.5);
  yPosition += addField('મોજે', formData.panchMoje || formData.moje || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('તાલુકો', formData.panchTaluko || formData.taluko || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('જીલ્લો', formData.panchJillo || formData.jillo || '', margin, yPosition);
  yPosition += 0.25;

  // Panch details table (for Maran)
  if (isMaran) {
    checkNewPage(1.0);
    doc.setFontSize(8);
    doc.setFont('Arial', 'bold');
    // Table header
    const colWidths = [2, 4, 2];
    let xPos = margin;
    doc.text('સબંધ', xPos, yPosition);
    xPos += colWidths[0];
    doc.text('રહેવાસી', xPos, yPosition);
    xPos += colWidths[1];
    doc.text('ડી.એચ.એલ.', xPos, yPosition);
    yPosition += 0.15;

    doc.setFont('Arial', 'normal');
    if (formData.panchDetails && Array.isArray(formData.panchDetails)) {
      formData.panchDetails.slice(0, 4).forEach((panch: any) => {
        checkNewPage(0.3);
        xPos = margin;
        addText(panch.relation || '_________________', xPos, yPosition, colWidths[0] - 0.1, 8);
        xPos += colWidths[0];
        addText(panch.resident || '_________________', xPos, yPosition, colWidths[1] - 0.1, 8);
        xPos += colWidths[1];
        addText(panch.dhl || '_________________', xPos, yPosition, colWidths[2] - 0.1, 8);
        yPosition += 0.15;
      });
    }
    yPosition += 0.15;

    checkNewPage(0.4);
    yPosition += addField('હયાત', formData.existing || '', margin, yPosition, 1.2);
    yPosition += 0.12;
    yPosition += addField('મરણ એમ કુલ', formData.totalDeaths || '', margin, yPosition, 1.2);
    yPosition += 0.2;
  }

  // Panch details (for both forms)
  if (formData.panchDetails && Array.isArray(formData.panchDetails)) {
    formData.panchDetails.forEach((panch: any, index: number) => {
      checkNewPage(1.2);
      doc.setFontSize(8);
      doc.setFont('Arial', 'bold');
      doc.text(`પંચ-${index + 1}:`, margin, yPosition);
      yPosition += 0.15;
      doc.setFont('Arial', 'normal');
      yPosition += addField('નામ', panch.name || '', margin + 0.2, yPosition, 1.2);
      yPosition += 0.1;
      if (!isMaran) {
        yPosition += addField('ઉમર', panch.age || '', margin + 0.2, yPosition, 1.2);
        yPosition += 0.1;
      }
      yPosition += addField('રહેવાસી', panch.resident || '', margin + 0.2, yPosition, 1.2);
      yPosition += 0.1;
      yPosition += addField('આધારકાર્ડ નં.', panch.aadhar || '', margin + 0.2, yPosition, 1.2);
      yPosition += 0.2;
    });
  }

  // Panch declaration
  checkNewPage(0.8);
  doc.setFontSize(7);
  const panchDeclText =
    'અમે પંચ આ કામના અરજદાર અને તેમના પરિવારને સારી રીતે જાણીએ છીએ. અરજદારે જે પેઢીનામું આપ્યું છે તે સાચું અને ખરું છે. કોઈ પણ કાનૂની વારસદાર છુટી ગયા નથી. ખોટું પેઢીનામું બનાવવું ફોજદારી ગુનો છે. વારસદારોના દસ્તાવેજોની તપાસ જરૂરી છે. જો કોઈ હકીકત છુપાવવામાં આવે તો પેઢીનામું રદ થશે.';
  const panchDeclHeight = addText(panchDeclText, margin, yPosition, contentWidth, 7);
  yPosition += panchDeclHeight + 0.2;

  // Final signatures
  checkNewPage(0.8);
  yPosition += addField('સ્થળ', formData.finalPlace || formData.place || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('તારીખ', formData.finalDate || formData.date || '', margin, yPosition);
  yPosition += 0.2;

  // Final section
  doc.setFontSize(7);
  const finalText = `આ પ્રમાણેનું પેઢીનામું અમે આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ ${formData.finalDate || '______'} ના રોજ નેટરી શ્રી ${formData.notaryDate || '______'} ના કામે ઉપયોગ કરી શકાશે.`;
  yPosition += addText(finalText, margin, yPosition, contentWidth, 7);
  yPosition += 0.15;

  if (formData.regNo || formData.serialNo) {
    yPosition += addField('રજી ને', formData.regNo || '', margin, yPosition, 1.2);
    yPosition += 0.12;
    yPosition += addField('ના સિ.નં', formData.serialNo || '', margin, yPosition, 1.2);
    yPosition += 0.15;
  }

  const finalNote =
    'આ પેઢીનામું વારસદારોનું પ્રમાણપત્ર અથવા પ્રોબેટ નથી. આ માત્ર પંચના રૂબરૂ જવાબ પર આધારિત છે. વારસદારોના દસ્તાવેજોની તપાસ જરૂરી છે. કોઈ પણ વિવાદ થાય તો કોર્ટનું વારસદાર પ્રમાણપત્ર અંતિમ માન્ય રહેશે. શ્રી કરેલ સોગંદનામું/સ્વધોષણા તથા પંચોના લખાવ્યા મુજબ તૈયાર કરેલ છે વારસદારોની ખોટા ખરા અંગે સબંધિત તલાટી કમ મંત્રીશ્રી જવાબદાર નથી.';
  checkNewPage(0.5);
  addText(finalNote, margin, yPosition, contentWidth, 7);

  yPosition += 0.3;
  checkNewPage(0.4);
  yPosition += addField('અરજદાર ની સહિ', formData.applicantSignature || '', margin, yPosition);
  yPosition += 0.12;
  yPosition += addField('રૂબરૂ', formData.inPerson || '', margin, yPosition);

  // Save PDF
  doc.save(`${isMaran ? 'maran' : 'hayati'}_pedhinamu.pdf`);
}
