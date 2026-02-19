import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface TreeMember {
  id: string;
  name: string;
  age?: string;
  relation?: string;
  hayat?: string;
  birth?: string;
  death?: string;
  deathDateType?: string;
  deathAashre?: string;
  children: TreeMember[];
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  address: string;
  gender: string;
  resident: string;
  photo?: string;
  signature?: string;
}

interface PanchMember {
  name: string;
  photo?: string;
  signature?: string;
  aadharNumber: string;
  age: string;
  resident: string;
  aadhar: string;
  income?: string;
  occupation?: string;
}

interface HayatiTemplateData {
  kamakNo: string;
  date: string;
  jillo: string;
  applicantLocation: string;
  applicantTaluka: string;
  applicantJillo: string;
  applicantName: string;
  applicantAge: string;
  applicantGender: string;
  applicantResident: string;
  applicantPhoto?: string;
  applicantSignature?: string;
  applicantAadharNumber: string;
  purpose: string;
  documentDate: string;
  applicationDate: string;
  familyTree: TreeMember[];
  familyMembers: FamilyMember[];
  panchMembers: PanchMember[];
  hayatCount: string;
  maranCount: string;
  totalHeirs: string;
  finalLocation: string;
  finalDate: string;
  notaryDate: string;
  notaryName: string;
  notaryAddress: string;
  notaryRegNo: string;
  serialNo: string;
}

// English → Gujarati digit conversion for PDF display
const gujaratiDigitsMap: Record<string, string> = {
  '0': '૦',
  '1': '૧',
  '2': '૨',
  '3': '૩',
  '4': '૪',
  '5': '૫',
  '6': '૬',
  '7': '૭',
  '8': '૮',
  '9': '૯',
};

const toGujaratiDigits = (text: string | number | undefined | null): string => {
  if (text === null || text === undefined) return '';
  return text
    .toString()
    .split('')
    .map((ch) => gujaratiDigitsMap[ch] || ch)
    .join('');
};

// Legal page size: 8.5 × 14 inches = 215.9 × 355.6 mm (portrait)
// Landscape: width × height = 355.6 × 215.9 mm
const LEGAL_PAGE_WIDTH_MM = 355.6;
const LEGAL_PAGE_HEIGHT_MM = 215.9;

// Recursive function to render the horizontal family tree (pedhi) as HTML
// Using the same logic as FamilyTree.tsx component where each child draws its own connector line
function renderPedhiTree(members: TreeMember[], level = 0): string {
  if (!members || members.length === 0) return '';

  const gapBetween = 12; // Gap between sibling boxes

  // Render a single member and their descendants
  const renderMember = (member: TreeMember, memberLevel: number): string => {
    const hasChildren = member.children && member.children.length > 0;
    const childCount = member.children?.length || 0;
    const isRoot = memberLevel === 0;

    const status = member.hayat;
    const deathDateType = member.deathDateType;

    const secondLine = (() => {
      if (status === 'હયાત') {
        // For alive members, show age
        return `ઉ.આ.વ.${member.age || ''}`;
      }

      // For deceased members, show death info based on type
      if (deathDateType === 'tarikh') {
        return `મરણ તા. ${member.death || ''}`;
      }

      // deathDateType === 'aashre' -> approximate age
      return `આશરે ઉંમર ${member.age || ''}`;
    })();

    return `
      <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
        ${!isRoot ? `
          <!-- Vertical line connecting to parent -->
          <div style="position: absolute; width: 2px; height: 20px; background: #000; top: -20px; left: 50%; transform: translateX(-50%);"></div>
        ` : ''}
        
        <!-- Member Box -->
        <div style="
          text-align: center; 
          width: 100%; 
          background: #fff; 
          padding: 4px 6px; 
          font-size: 11px;
          margin-bottom: 4px;
        ">
          <div style="font-weight: 500; line-height: 1.2;">
            ${member.name}${member.relation ? ` (${member.relation})` : ''}
          </div>
          <div style="font-size: 10px; line-height: 1.2;">
            ${secondLine}
          </div>
        </div>
        
        ${hasChildren ? `
          <div style="margin-top: 24px; display: flex; flex-direction: column; align-items: center; width: 100%; position: relative;">
            ${childCount === 1 ? `
              <!-- Single child: direct connection -->
              ${renderMember(member.children[0], memberLevel + 1)}
            ` : `
              <!-- Multiple children: with horizontal connectors -->
              <div style="display: flex; justify-content: center; align-items: flex-start; gap: ${gapBetween}px; position: relative;">
                ${member.children.map((child, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === childCount - 1;

      // Each child draws its portion of the horizontal line
      // This matches the logic from FamilyTree.tsx lines 384-386
      let horizontalLine = '';
      if (isFirst) {
        // First child: line from center extending right
        horizontalLine = `<div style="position: absolute; height: 2px; background: #9ca3af; top: -20px; left: 50%; width: calc(50% + ${gapBetween / 2}px);"></div>`;
      } else if (isLast) {
        // Last child: line from center extending left
        horizontalLine = `<div style="position: absolute; height: 2px; background: #9ca3af; top: -20px; right: 50%; width: calc(50% + ${gapBetween / 2}px);"></div>`;
      } else {
        // Middle children: line extending both ways
        horizontalLine = `<div style="position: absolute; height: 2px; background: #9ca3af; top: -20px; left: -${gapBetween / 2}px; width: calc(100% + ${gapBetween}px);"></div>`;
      }

      return `
                    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                      ${horizontalLine}
                      ${renderMember(child, memberLevel + 1)}
                    </div>
                  `;
    }).join('')}
              </div>
            `}
          </div>
        ` : ''}
      </div>
    `;
  };

  // Render all root level members
  return `
    <div style="display: flex; justify-content: center; align-items: flex-start; gap: ${gapBetween}px; flex-wrap: wrap;">
      ${members.map(member => renderMember(member, 0)).join('')}
    </div>
  `;
}

// Helper function to load font
const loadFont = async (fontName: string, fontUrl: string): Promise<void> => {
  try {
    const font = new FontFace(fontName, `url(${fontUrl})`);
    await font.load();
    document.fonts.add(font);
    console.log(`Font loaded: ${fontName}`);
  } catch (error) {
    console.error(`Error loading font ${fontName}:`, error);
  }
};

// Helper function to wait for all images to load
const waitForImages = async (container: HTMLElement): Promise<void> => {
  const images = container.getElementsByTagName('img');
  const promises: Promise<void>[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img.complete) {
      promises.push(
        new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
        })
      );
    }
  }

  await Promise.all(promises);
  console.log('All images loaded');
};

export const generateHayatiPDF = async (data: HayatiTemplateData,) => {

  try {
    // Load Gujarati fonts before rendering
    await loadFont('Noto Sans Gujarati', '/fonts/NotoSansGujarati-Regular.ttf');
    await loadFont('Noto Sans Gujarati Bold', '/fonts/NotoSansGujarati-Bold.ttf');

    // Wait a bit for fonts to be applied
    await new Promise(resolve => setTimeout(resolve, 500));

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = "'Noto Sans Gujarati', sans-serif";
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';

    document.body.appendChild(container);

    const getPage1Html = (data: HayatiTemplateData) => {
      return `
    <div style="height: 100%; min-height: 100%; display: flex; flex-direction: column; padding: 4mm 10mm; font-family: 'Noto Sans Gujarati', sans-serif; background: white; box-sizing: border-box;">
      <div style="flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0;">
        <!-- Top Header Section -->
        <div>
          <div>
            <p style="text-align: left; font-size: 11px; color: #000; margin-bottom: 8px;">
              ${new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}
            </p>
            <div style="display: flex; align-items: center; ">       
              <!-- Left side -->
              <p
                style="
                  font-size: 16px;
                  padding: 0px 8px 12px 8px;
                  font-weight: 600;
                  color: #111827;
                  border-radius: 10px;
                  background: linear-gradient(to bottom, #e5e7eb, #9ca3af);
                  border: 1px solid #9ca3af;
                "
              >
                હયાતી પેઢીનામું
              </p>

              <!-- Center text -->
              <div style="
                font-size: 20px;
                font-weight: bold;
                color: #000;
                margin: 0 auto;
                text-align: center;
                ">
                ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક: હકપ/૧૦૨૦૧૪/૭૫૬/જ. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું
              </div>
            </div>
        </div>
          
          <!-- Location Fields -->
          <div style="text-align: center; font-size: 16px; color: #000;">
            <span>મોજે :<span style="border-bottom: 1px solid #000; padding: 0 30px 10px 30px; display: inline-block; margin: 0 10px;">${data.applicantLocation || ''}</span></span>
            <span>તાલુકો :<span style="border-bottom: 1px solid #000; padding: 0 30px 10px 30px; display: inline-block; margin: 0 10px;">${data.jillo || ''}</span></span>
            <span>જિલ્લો :<span style="border-bottom: 1px solid #000; padding: 0 30px 10px 30px; display: inline-block; margin: 0 10px;">${data.applicantJillo || ''}</span></span>
          </div>
        </div>

        <!-- Central Content Area with Diamond Pattern (grows to fill space, reduces gap above footer) -->
        <div style="flex: 1 1 auto; position: relative; min-height: 200px; overflow: hidden;">
        <svg
          style="position:absolute; inset:0; width:100%; height:100%;"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <!-- Taller/thinner diamond pattern -->
              <pattern id="bigDiamond" width="10" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M5,0 L10,12 L5,24 L0,12 Z"
                  fill="none"
                  stroke="#A9A9A9"
                  stroke-width="0.15"
                  stroke-dasharray="0.7,0.7"
                />
              </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bigDiamond)" />
        </svg>

          <!-- Family Tree Structure matching the image -->
          <div style="position: relative; z-index: 1; text-align: center; color: #000; line-height: 1.4; margin: 0 auto; max-width: 95%;">
            <!-- Dynamically generated Family Tree -->
            ${(data.familyTree && data.familyTree.length > 0)
          ? renderPedhiTree(data.familyTree)
          : `<div style=\"font-size: 11px; color: #666; padding: 20px;\">પેઢી માટે કોઈ ડેટા ઉપલબ્ધ નથી</div>`
        }
          </div>
        </div>

        <!-- Description Text from image -->
        <p style="font-size: 16px; line-height: 1.2; text-align: justify; margin: 5px 0; color: #000; text-indent:80px" >
          હું નીચે સહી કરનાર (અરજદાર) આજરોજ તલાટી કર્મ મંત્રી ${data.applicantTaluka} તા. ${data.applicantLocation} જિ. ${data.applicantLocation} રૂબરૂ હાજર થઈ પૂછવાથી લખાવું છું કે હું પોતે ${data.applicantName} રહેવાસી ${data.applicantLocation} તા. ${data.applicantTaluka} જિ. ${data.applicantLocation} હયાત છું અને આ પેઢીનામું  ${data.purpose || ''} ના કામે જરૂર હોય પેઢીનામું મેળવવા માટે, તારીખ ${toGujaratiDigits(data.date)} ના રોજ અમોએ અરજી કરેલી છે, તે અરજી અન્વયે આજરોજ પંચો રૂબરૂ હાજર રહી લખાવું છું કે, મારા સીધીલીટી ના ઉપરોક્ત દર્શાવ્યા સિવાયના અન્ય કોઈ વારસદારો બાકી રહેતા નથી, તેમ છતા કોઈ વારસદારો બાકી નીકળે તો તમામ જવાબદારી મારી પોતાની રહેશે અને જો પેઢીનામું ખોટું ઠરે તો તેમાં અમે અરજદાર તથા પંચો જવાબદાર રહેશું. અમોએ ખોટા વારસદારો બતાવેલ નથી તથા સાચા વારસદારો બાકી રાખેલ નથી, ખોટું પેઢીનામું લખાવવું એ ફોજદારી ગુનો બને છે, જેની અમોને જાણ છે, આ પેઢીનામાં બાબતે રૂબરૂમાં સહી કરનાર તલાટી કમ મંત્રી જવાબદાર નથી.
        </p>

        <div style="font-size: 16px; line-height: 1.2; text-align: justify; color: #000;">
          ઉપર મુજબનું પેઢીનામું અમે પંચોના લખાવા મુજબનું શુધ્ધ બુધ્ધિથી અક્કલ હોશિયારીથી કોઈપણ જાતના દાબ-દબાણ લોભ-લાલચ સિવાયનું લખાવા મુજબનું સાચું અને ખરૂ છે, જે અમોએ વાંચી સમજી સાંભળી વિચારીને નીચે સહી કરી આપેલ છે. જે મને કબૂલ મંજૂર છે.
        </div>

        <!-- Bottom Signature Section -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin: 11px 0 8px 0; font-size: 16px; color: #000;">
          <!-- Left: Location, Date, Panch signatures -->
          <div style="flex: 1.2; line-height: 1.4;">
            <div style="margin-bottom: 6px;">સ્થળ:-
              <span style="
                display: inline-block;
                width: 40%;
              border-bottom: 1px solid #000;
              height: 34px;
            ">
            &nbsp;
            ${data.applicantLocation}
           </span>  
           
            </div>
            <div style="margin-bottom: 10px;">તારીખ:-
              <span style="
                    display: inline-block;
                    width: 40%;
                  border-bottom: 1px solid #000;
                  height: 34px;
                ">
              &nbsp;
              ${toGujaratiDigits(data.date)}
            </span>              
            </div>
            રૂબરૂ
          </div>

          <div style="flex: 1; line-height: 1; font-size: 16px;">
              <div style="">પંચો ની સહી</div>
                <div style="display: flex; flex-direction: column; gap: 1px; padding-left: 4px;">
                ${(data.panchMembers || []).map((panch, idx) => `
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span >${idx + 1}</span>
                    <span style="
                  display: inline-block;
                  width: 80%;
                border-bottom: 1px solid #000;
                height: 30px;
              ">
            &nbsp;
          </span>     
                  </div>
                `).join('')}
              </div>
          </div>    

          <!-- Middle: Writer signature line -->
          <div style="flex: 1; text-align: center; padding-top: 40px;">
            <span style="
                display: inline-block;
                width:80%;
              border-bottom: 1px solid #000;
              height: 45px;
            ">
          &nbsp;
        </span>            
        <div style="font-size: 16px; ">પેઢીનામું લખનારની સહી</div>
          </div>

          <!-- Right: Photo, thumb and Aadhar -->
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
            <div style="display: flex; align-items: flex-start; gap: 18px;">
              <div>
                <div style="
                  border: 1px dashed #000;
                  border-radius: 6px;
                  width: 120px;
                  height: 160px;
                  background: #fff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ${data.applicantPhoto
          ? `<img src="${data.applicantPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`
          : `<div style="font-size:14px; color:#000;">પંચનો ફોટો</div>`
        }
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 0;">
                <!-- Thumb impression and Aadhar vertically aligned -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                  <div style="
                    border: 1px dashed #000;
                    width: 160px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "></div>
                  <div style="font-size: 16px; margin-bottom: 8px;">અંગુઠાનું નિશાન</div>
                </div>
                <div style="
                  font-size: 16px;
                  display: flex;
                  align-items: center;
                  gap: 11px;
                  width: 100%;
                ">
                  <span style="white-space: nowrap;">આધાર કાર્ડ નંબર:</span>
                  <span style="
                    display: inline-block;
                    width: 80%;
                    border-bottom: 1px solid #000;
                    height: 40px;
                  ">
                    ${data.applicantAadharNumber}
                    &nbsp;
                  </span>
                </div>
              </div>
            </div>
          </div>
       </div>
      </div>

        <!-- Footer: fixed at bottom, minimal space -->
        <div style="
          flex: 0 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          line-height: 1;
          color: #666;
          padding: 0 2mm;
          border-top: 1px solid #e5e5e5;
          margin-top: 2px;
        ">
          <span>https://pedhinama.com/hayati</span>
          <span>1/2</span>
        </div>
    </div>
        `;
    }

    container.innerHTML = `${getPage1Html(data)}`;

    // Wait for images to load
    await waitForImages(container);

    // Wait a bit more for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Legal size: capture at aspect ratio 355.6 : 215.9 (landscape)
    const captureWidth = 1400;
    const captureHeight = Math.round(captureWidth * LEGAL_PAGE_HEIGHT_MM / LEGAL_PAGE_WIDTH_MM); // ~850
    container.style.width = `${captureWidth}px`;
    container.style.height = `${captureHeight}px`;
    container.style.overflow = 'hidden';

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [LEGAL_PAGE_WIDTH_MM, LEGAL_PAGE_HEIGHT_MM],
      compress: true
    });

    // Render page 1 at Legal size
    const canvas1 = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
    } as any);

    const imgData1 = canvas1.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData1, 'JPEG', 0, 0, LEGAL_PAGE_WIDTH_MM, LEGAL_PAGE_HEIGHT_MM);


    // Page 2
    // કુલ પંચની સંખ્યા
    const totalPanch = data.panchMembers.length;
    let itemsPerRow = 5; // ડિફૉલ્ટ 5

    // જો 4 કે તેથી ઓછા હોય તો
    if (totalPanch <= 4) {
      itemsPerRow = totalPanch;
    }

    // દરેકની width ગણો
    const itemWidth = 100 / itemsPerRow;

    const panchMembersHtml = `
    <div style="
      width: 100%;
      overflow: hidden;
      font-family: 'Noto Sans Gujarati', sans-serif;
    ">
  ${data.panchMembers.map((panch, index) => `
    <div style="
  width: ${itemWidth}%;
  float: left;
  box-sizing: border-box;
  padding: 6px;
  text-align: center;
  font-family: 'Noto Sans Gujarati', sans-serif;
">

  <!-- Card Container -->
  

    <!-- Photo + Thumb Row -->
    <div style="
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: flex-start;
    ">

      <!-- Photo -->
      <div style="
        border: 1px dashed #000;
        border-radius: 6px;
        width: 120px;
        height: 160px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${panch.photo
        ? `<img src="${panch.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`
        : `<div style="font-size:14px; color:#000;">પંચનો ફોટો</div>`
      }
      </div>

      <!-- Thumb Impression -->
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      ">
        <div style="font-size: 14px;  color: #000;">અંગુઠાનું નિશાન</div>
        <div style="
          border: 1px dashed #000;
          width: 130px;
          height: 70px;">
          </div>
           <!-- Panch Index -->
            <div style="
              margin-top: 6px;
              font-size: 11px;
              color: #000;">
              પંચ - ${index + 1}
            </div>
              <!-- Aadhaar -->
          <div style="
                  font-size: 11px;
                  display: flex;
                  align-items: center;
                  
                  width: 100%;
                ">
                  <span style="white-space: nowrap; color: #000;">આધારકાર્ડ નં:</span>
                  <span style="color: #000;
                    display: inline-block;
                    width: 80%;
                    border-bottom: 1px solid #000;
                    height: 40px;
                  ">
                    ${panch.aadharNumber}
                    &nbsp;
                  </span>
                </div>
      </div>
    </div>
</div>
  `).join('')}
  <div style="clear: both;"></div>
    </div>`;


    const getPage2Html = (data: HayatiTemplateData) => {
      return `
      <div style="height: 100%; min-height: 100%; display: flex; flex-direction: column; padding: 4mm 10mm; line-height: 1.6; font-family: 'Noto Sans Gujarati', sans-serif; box-sizing: border-box; background: #fff; position: relative;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.06; background-image: repeating-linear-gradient(45deg, transparent, transparent 18px, #888 18px, #888 19px), repeating-linear-gradient(-45deg, transparent, transparent 18px, #888 18px, #888 19px); z-index: 0; pointer-events: none;"></div>
        
        <div style="flex: 1 1 auto; min-height: 0; position: relative; z-index: 1;">
          <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #000; margin-bottom: 20px;">
            ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : 'હકપ/૧૦૨૦૧૪/૭૧૬/જ.' તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામાં અંગેના રૂવાબો પંચો જવાબ
          </div>

          <div style="font-size: 16px; color: #000; width: 100%; ">
            ${(data.panchMembers || []).map((panch, index) => `
              <div style=" width: 100%; display: flex; align-items: baseline; box-sizing: border-box; ">

                <!-- No + Name -->
                <div style="width: 50%; display: flex; margin-left: 15px;">
                  <p>${index + 1}.</p>
                  <div style="width: 100%;">
                    <span style=" display: inline-block; width: 50%;  height:20px; padding-bottom: 2px;">
                      ${panch.name || ''}
                    </span>
                    <div style=" height: 1px; width: inherit; background-color: #000"></div>
                  </div>
                </div>


                <!-- Age -->
                <div style="width: 10%; display: flex; margin-left: 15px;">
                  <p>ઉ.આ.વ:</p>
                  <div style="width: 100%;">
                    <span style=" display: inline-block; width: 50%;  height:20px; padding-bottom: 2px;">
                      ${panch.age || ''}
                    </span>
                    <div style=" height: 1px; width: inherit; background-color: #000"></div>
                  </div>
                </div>


                <!-- Occupation -->
                <div style="width: 10%; display: flex; margin-left: 15px;">
                  <p>ધંધો:</p>
                  <div style="width: 100%;">
                    <span style=" display: inline-block; width: 50%;  height:20px; padding-bottom: 2px;">
                      ${panch.occupation || ''}
                    </span>
                    <div style=" height: 1px; width: inherit; background-color: #000"></div>
                  </div>
                </div>

                <!-- Resident -->
                <div style="width: 30%; display: flex; margin-left: 15px;">
                  <p>રહેવાસી:</p>
                  <div style="width: 100%;">
                    <span style=" display: inline-block; width: 50%;  height:20px; padding-bottom: 2px;">
                      ${panch.resident || ''}
                    </span>
                    <div style=" height: 1px; width: inherit; background-color: #000"></div>
                  </div>
                </div>
                </div>
              `).join('')}
            </div>

          <div style="font-size: 16px; line-height: 1.2; text-align: justify; color: #000;">
          <p style="margin: 0 0 8px 0; text-indent:80px">
            અમો નીચે સહી કરનાર પંચો આજરોજ રૂબરૂ હાજર થઇ લખાવીએ છીએ કે, અમો અરજદાર તથા તેમના કુટુંબીજનોને વારસદારોને સારી રીતે ઓળખીએ છીએ,અરજદારનો જવાબ અમારી રૂબરૂ લેવામાં આવ્યો છે. જેમાં તેમણે પાન નં. ૧ ઉપર લખાવેલ પેઢીનામાની ખાતરી કરતાં તેમાં દર્શાવેલ કુલ  ${data.hayatCount || '૦'} હયાત + ${data.maranCount || '૦'} મરણ એમ કુલ ${data.totalHeirs || '૦'} વારસદાર છે. જેમાં કોઈ કાયદેસરના વારસદારો લખવાના રહી જતા નથી. ખોટું પેઢીનામું લખાવવું ફોજદારી ગુનો છે. જેની અમોને સમજ છે.
          </div>
          </p>

          <div style="font-size: 16px; line-height: 1.2;  text-align: justify; color: #000;">
            ઉપર મુજબનું પંચનામું અમો પંચોના લખાવ્યા મુજબનું શુધ્ધ બુધ્ધિથી અક્કલ હોશિયારીથી કોઈપણ જાતના દાબ-દબાણ લોભ-લાલચ સિવાયનું લખાવ્યા મુજબનું સાચું અને ખરું છે, જે અમોએ વાંચી સમજી સાંભળી વિચારીને નીચે સહી કરી આપેલ છે, એ બરાબર છે.
          </div>

          <div style="font-size: 16px; text-align: justify; line-height: 1.2; margin: 8px 0; color: #000; ">
            <p style="margin: 0 0 8px 0; text-indent: 80px;">
              આ પેઢીનામું બનાવતી વખતે વારસદારોની ખાતરી કરવા અંગે જરૂરી સાધનિક પુરાવા રજુ થયેલ નથી. જેની આ પેઢીનામું નિર્યાણક પુરાવા તરીકે ગણાશો નહી અને જે કચેરીમાં રજુ થાય તે કચેરીના અધિકારીશ્રીઓએ આ પેઢીનામાની જરૂર જણાયે વારસદાર અંગે સાધનિક પુરાવાની ખાતરી કરવાની રહેશે. આ પેઢીનામામાં અરજદારે અથવા અમે પંચો કોઈ હકીકત છુપાવ્યાનું જાહેર થશે તો આ પેઢીનામું આપોઆપ રદ થયેલ ગણાશે. ખોટી હકીકત લખાવવી, અને સાચી હકીકત છુપાવવી તે ફોજદારી ગુન્હો બને છે જેની અમોને જાણ છે. જે અમોને વાંચી, વંચાવી, સાંભળી અને વિચારીને સહી કરેલ છે. જે અમોને કબુલ મંજુર છે.
            </p>
          </div>

          <div style="margin-top: 15px; text-align: center;">
            ${panchMembersHtml}
          </div>

          <div style="display: flex; gap: 20px; font-size: 16px; margin-top: 11px; color: #000;">
          <div>સ્થળ :-</strong> ${data.finalLocation}</div>
          <div>તારીખ :-</strong> ${toGujaratiDigits(data.finalDate)}</div>
        </div>

          <div style="font-size: 16px; text-align: justify; line-height: 1.2; margin-top: 8px; color: #000;">
            <p style="text-indent: 80px; margin: 0;">
              આ પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ ${toGujaratiDigits(data.notaryDate)} ના રોજ નોટરી શ્રી ${data.notaryName} રજી નં. ${data.notaryRegNo} ના સિ.નં. ${data.notaryRegNo} તારીખ ${toGujaratiDigits(data.applicationDate)} થી કરેલ સોંગદનામું/સ્વઘોષણા તથા પંચોના લખાવ્યા મુજબ તૈયાર કરેલ છે. વારસદારોની ખોટા ખરા અંગે સબંધિત તલાટીકમ મંત્રીશ્રી જવાબદાર નથી. 
            </p>
            <p style="margin: 6px 0 0 0;">આ પેઢીનામું  ${data.purpose || ''} ના કામે ઉપયોગ કરી શકાશે.</p>

            <div style="font-size: 16px; text-align: justify; line-height: 1.2; margin: 8px 0; color: #000;">
            <p style="margin: 0 0 8px 0; ">
              સદર પેઢીનામું વારસાઈ પ્રમાણપત્ર કે પ્રોબ્રેટ નથી પેઢીનામાંમા માત્ર રૂબરૂ જવાબ પંચોનું પંચનામું સામેલ છે. વારસદારો અંગે સાંધનિક પુરાવાની ખાતરી અલગથી કરવાની રહેશે, આ પેઢીનામામાં દર્શાવેલ વારસદારો અંગે કોઈ વિવાદ થશે તો કોર્ટનું વારસાઈ સર્ટિફિકેટ આખરી ગણાશે.
            </p>
          </div>
          </div>

          <div style="margin-top: 18px; font-size: 16px; color: #000; width: 100%; padding: 0 11px; box-sizing: border-box;">
            <div style="display: flex; justify-content: flex-end; gap: 40px;">
              <div style="text-align: center;">
                <div style="">અરજદાર ની સહી</div>
                <span style="border-bottom: 1px solid #000; padding: 0px 30px 40px 30px; display: inline-block; margin: 0 10px;"></span>
              </div>
              <div style="text-align: center;">
                <div style="margin-bottom: 4px;">રૂબરૂ</div>
              </div>
            </div>
          </div>
        </div>

           <!-- Footer: fixed at bottom, minimal space -->
        <div style="
          flex: 0 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          line-height: 1;
          color: #666;
          padding: 0 2mm;
          border-top: 1px solid #e5e5e5;
          margin-top: 2px;
        ">
          <span>https://pedhinama.com/hayati</span>
          <span>2/2</span>
        </div>
      </div>
        `;
    }

    container.innerHTML = `${getPage2Html(data)}`;

    // Wait for images to load on page 2
    await waitForImages(container);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Render page 2 at Legal size
    pdf.addPage([LEGAL_PAGE_WIDTH_MM, LEGAL_PAGE_HEIGHT_MM]);

    const canvas2 = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
    } as any);

    const imgData2 = canvas2.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData2, 'JPEG', 0, 0, LEGAL_PAGE_WIDTH_MM, LEGAL_PAGE_HEIGHT_MM);

    const fileName = `હયાતી_પેઢીનામું_${data.applicantName}_${new Date().getTime()}.pdf`;

    // Remove container
    document.body.removeChild(container);

    // Check if running on native mobile platform
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      // Mobile: Use Filesystem API
      try {
        const pdfOutput = pdf.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];

        // Save to device
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true
        });

        console.log('PDF saved to:', savedFile.uri);

        // Share the PDF so user can save/open it
        await Share.share({
          title: 'હયાતી પેઢીનામું',
          text: 'તમારું હયાતી પેઢીનામું તૈયાર છે',
          url: savedFile.uri,
          dialogTitle: 'PDF શેર કરો'
        });

        return {
          success: true,
          fileName,
          filePath: savedFile.uri,
          platform: 'mobile'
        };
      } catch (mobileError) {
        console.error('Error saving PDF on mobile:', mobileError);
        return { success: false, error: mobileError, platform: 'mobile' };
      }
    } else {
      // Web: Use standard download
      pdf.save(fileName);

      // Optionally open in new tab
      // const blobUrl = pdf.output('bloburl');
      // window.open(blobUrl, '_blank');

      return {
        success: true,
        fileName,
        platform: 'web'
      };
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error };
  }
};