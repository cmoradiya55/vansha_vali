'use client';

import { useState } from 'react';
import FamilyTree from '@/components/FamilyTree';
import PhotoUpload from '@/components/PhotoUpload';
import DatePicker from '@/components/DatePicker';
import RequiredLabel from '@/components/RequiredLabel';
import { generatePDF } from '@/utils/pdfGenerator';
import { generatePDFFromHTML } from '@/utils/pdfGeneratorHtml2Canvas';
import { handleGujaratiInput, handleGujaratiPaste, filterGujaratiOnly } from '@/utils/gujaratiInputValidator';
// Simple SVG Icon Components for website

const PrintIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 19.5 4.5 17.25m0 0L6.75 15M4.5 17.25H19.5m-15 0v-1.5m15 1.5v-1.5m0-12.75h-15m15 0v12.75m-15 0h15" />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

interface FamilyMember {
  id: string;
  name: string;
  age?: string;
  relation?: string;
  hayat?: string;
  birth?: string;
  death?: string;
  deathDateType?: string;
  deathAashre?: string;
  children: FamilyMember[];
}

interface PanchDetail {
  name: string;
  age: string;
  resident: string;
  aadhar: string;
  income?: string;
  occupation?: string;
  photo?: string;
}

// Location data: moje -> taluka -> jillo mapping
const locationData: { [key: string]: { taluka: string; jillo: string } } = {
  'અમદાવાદ': { taluka: 'અમદાવાદ', jillo: 'અમદાવાદ' },
  'સુરત': { taluka: 'સુરત', jillo: 'સુરત' },
  'વડોદરા': { taluka: 'વડોદરા', jillo: 'વડોદરા' },
  'રાજકોટ': { taluka: 'રાજકોટ', jillo: 'રાજકોટ' },
  'ભાવનગર': { taluka: 'ભાવનગર', jillo: 'ભાવનગર' },
  'જામનગર': { taluka: 'જામનગર', jillo: 'જામનગર' },
  'ગાંધીનગર': { taluka: 'ગાંધીનગર', jillo: 'ગાંધીનગર' },
};

export default function HayatiPage() {
  const [formData, setFormData] = useState({
    moje: '',
    taluko: '',
    jillo: '',
    applicantDate: '',
    pedhinamuPurpose: '',
    pedhinamuDate: '',
    applicationDate: '',
    place: '',
    date: '',
    applicantPhoto: '',
    applicantAadharNumber: '',
    panchDetails: [
      { name: '', age: '', aadhar: '', income: '', occupation: '', photo: '' },
      { name: '', age: '', aadhar: '', income: '', occupation: '', photo: '' },
      { name: '', age: '', aadhar: '', income: '', occupation: '', photo: '' },
    ] as PanchDetail[],
    hayatCount: '',
    maranCount: '',
    totalHeirs: '',
    finalPlace: '',
    finalDate: '',
    notaryDate: '',
    notaryName: '',
    regNo: '',
    serialNo: '',
    pedhinamuPurposeFinal: '',
    applicantSignature: '',
    inPerson: '',
    panchThumbImpression: ['', '', ''],
    applicantName: '',
  });

  const handlePhotoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePanchPhotoChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newPanchDetails = [...prev.panchDetails];
      newPanchDetails[index] = { ...newPanchDetails[index], photo: value };
      return { ...prev, panchDetails: newPanchDetails };
    });
  };


  const [familyTree, setFamilyTree] = useState<FamilyMember[]>([]);

  const handleInputChange = (field: string, value: string) => {
    // Filter out non-Gujarati characters for text fields (except dates, numbers, etc.)
    const textFields = [
      'applicantName', 'pedhinamuPurpose', 'applicantAadharNumber',
      'panchMoje', 'panchTaluko', 'panchJillo', 'finalPlace', 'notaryName',
      'regNo', 'serialNo', 'pedhinamuPurposeFinal', 'applicantSignature', 'inPerson'
    ];

    let filteredValue = value;
    if (textFields.includes(field)) {
      filteredValue = filterGujaratiOnly(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: filteredValue };

      // Auto-fill taluka and jillo when moje is selected
      if (field === 'moje' && filteredValue && locationData[filteredValue]) {
        updated.taluko = locationData[filteredValue].taluka;
        updated.jillo = locationData[filteredValue].jillo;
      }

      // Auto-fill panch taluka and jillo when panch moje is selected
      // if (field === 'panchMoje' && filteredValue && locationData[filteredValue]) {
      //   updated.panchTaluko = locationData[filteredValue].taluka;
      //   updated.panchJillo = locationData[filteredValue].jillo;
      // }

      return updated;
    });
  };

  const handlePanchChange = (index: number, field: string, value: string) => {
    // Filter out non-Gujarati characters for text fields
    const textFields = ['name', 'resident', 'aadhar', 'income', 'occupation'];
    let filteredValue = value;
    if (textFields.includes(field)) {
      filteredValue = filterGujaratiOnly(value);
    }

    setFormData((prev) => {
      const newPanch = [...prev.panchDetails];
      newPanch[index] = { ...newPanch[index], [field]: filteredValue };
      return { ...prev, panchDetails: newPanch };
    });
  };

  const addPanch = () => {
    setFormData((prev) => ({
      ...prev,
      panchDetails: [...prev.panchDetails, { name: '', age: '', resident: '', aadhar: '', income: '', occupation: '' }],
      panchThumbImpression: [...prev.panchThumbImpression, ''],
    }));
  };

  const deletePanch = (index: number) => {
    setFormData((prev) => {
      const newPanchDetails = prev.panchDetails.filter((_, i) => i !== index);
      const newPanchThumbImpression = prev.panchThumbImpression.filter((_, i) => i !== index);
      return {
        ...prev,
        panchDetails: newPanchDetails,
        panchThumbImpression: newPanchThumbImpression,
      };
    });
  };

  const handlePrint = () => {
    // Use html2canvas to capture the form and generate PDF
    generatePDFFromHTML('hayati-form-container', 'hayati_pedhinamu.pdf', {
      format: 'legal',
      orientation: 'landscape',
      quality: 1,
      scale: 2,
    });
  };

  const flattenFamilyTree = (members: FamilyMember[]): any[] => {
    const result: any[] = [];
    const traverse = (member: FamilyMember) => {
      result.push({
        name: member.name,
        age: member.age,
        relation: member.relation,
      });
      member.children.forEach(traverse);
    };
    members.forEach(traverse);
    return result;
  };

  return (
    <div id="hayati-form-container" className="mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Title */}
      <div className="text-center mb-2 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-black">હયાતી</h1>
      </div>

      {/* Reference */}
      <p className="text-center text-black leading-relaxed">
        ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/૪. તા. ૧૪/૦૫/૨૦૧૪
        મુજબનું પેઢીનામું
      </p>

      {/* Location Fields */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        <div className="flex gap-2">
          <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">મોજે</RequiredLabel>
          <select
            value={formData.moje}
            onChange={(e) => handleInputChange('moje', e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
          >
            <option value="">મોજે પસંદ કરો</option>
            {Object.keys(locationData).map((moje) => (
              <option key={moje} value={moje}>
                {moje}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">તાલુકો</RequiredLabel>
          <input
            type="text"
            value={formData.taluko}
            onChange={(e) => handleInputChange('taluko', e.target.value)}
            onKeyDown={handleGujaratiInput}
            onPaste={handleGujaratiPaste}
            placeholder="તાલુકો"
            required
            readOnly={true}
            className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
          />
        </div>
        <div className="flex gap-2">
          <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">જીલ્લો</RequiredLabel>
          <input
            type="text"
            value={formData.jillo}
            onChange={(e) => handleInputChange('jillo', e.target.value)}
            onKeyDown={handleGujaratiInput}
            onPaste={handleGujaratiPaste}
            placeholder="જીલ્લો"
            required
            readOnly={true}
            className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
          />
        </div>
      </div>

      {/* Family Tree */}
      <div className="rounded-lg border border-gray-300 bg-white p-2 sm:p-4">
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-black">પેઢીનામું</h3>
        <FamilyTree members={familyTree} onChange={setFamilyTree} showBirthDeath={false} />
      </div>

      {/* Applicant Declaration */}
      <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
        <div className="mb-3 sm:mb-4 rounded-lg bg-yellow-100 px-3 sm:px-4 py-2">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-800">અરજદારની જાહેરાત</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-black">
          <p className='leading-[40px]'> હું નીચે સહિ કરનાર (અરજદાર) આજરોજ તલાટી કમ મંત્રી </p>
          <div className="flex flex-col">
            <div className="font-medium mx-auto -mb-1">{formData.moje}</div>
            <div className="w-[100px] border-b-1 border-black mt-1"></div>
          </div> તા.
          <div className="flex flex-col">
            <div className="font-medium mx-auto -mb-1">{formData.taluko}</div>
            <div className="w-[100px] border-b-1 border-black mt-1"></div>
          </div> જી.
          <div className="flex flex-col">
            <div className="font-medium mx-auto -mb-1">{formData.jillo}</div>
            <div className="w-[100px] border-b-1 border-black mt-1"></div>
          </div>
          <p className='leading-[30px]'> રૂબરૂ હાજર થઈ પૂછવાથી લખાવું છે કે હું પોતે </p>
          <div className="flex flex-col items-center w-full min-w-[200px] max-w-[300px]">
            <input
              type="text"
              value={formData.applicantName}
              onChange={(e) => handleInputChange('applicantName', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="નામ"
              required
              className="w-full -mb-2 text-center text-black pb-1 text-xs sm:text-sm"
            />
            <div className="w-full border-b-1 border-black mt-1"></div>
          </div> રહેવાસી
          <div className="flex flex-col">
            <div className="font-medium mx-auto -mb-1">{formData.moje}</div>
            <div className="w-[100px] border-b-1 border-black mt-1"></div>
          </div> તા.
          <div className="flex flex-col">
            <div className="font-medium mx-auto -mb-1">{formData.taluko}</div>
            <div className="w-[100px] border-b-1 border-black mt-1"></div>
          </div> જી.
          <div className="flex flex-col">
            <div className="font-medium mx-auto -mb-1">{formData.jillo}</div>
            <div className="w-[100px] border-b-1 border-black mt-1"></div>
          </div> 
          <p className='leading-[30px]'> હયાત છું અને આ પેઢીનામું </p>
          <div className="flex flex-col items-center w-full sm:min-w-[200px] sm:max-w-[300px]">
            <input
              type="text"
              value={formData.pedhinamuPurpose}
              onChange={(e) => handleInputChange('pedhinamuPurpose', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="હેતુ"
              required
              className="w-full -mb-2 text-center text-black pb-1 text-xs sm:text-sm"
            />
            <div className="w-full border-b-1 border-black mt-1"></div>
          </div>
          <p className='leading-[30px]'>ના કામે જરૂર હોય પેઢીનામું મેળવવા માટે, તારીખ </p>
          <div className="w-[150px] h-[40px]">
            <DatePicker
              value={formData.pedhinamuDate}
              onChange={(value) => handleInputChange('pedhinamuDate', value)}
            />
          </div> 
          <p className="leading-[30px]"> ના રોજ અમોએ અરજી કરેલી છે, તે અરજી અન્વયે આજરોજ પંચો રૂબરૂ હાજર રહિ લખાવું છે કે, મારા સીધીલીટી ના ઉપરોકત દર્શાવ્યા સિવાયના અન્ય કોઈ વારસદરો બાકી રહેતા નથી. તેમ છતા ભવિષ્યમાં કોઈ વારસદરો નિકળે તો તેની તમામ જવાબદારી મારી પોતાની રહેશે. અને જો પેઢીનામું ખોટું ઠરે તો તેમાં અમે અરજદાર તથા પંચો જવાબદાર રહેશું અમોએ ખોટા વારસદરો બતાવેલ નથી તથા સાચા વારસદરો બાકી રાખેલ નથી. ખોટું પેઢીનામું લખાવવું એ ફોજદારી ગુનો બને છે જેની અમો ને જાણ છે. આ પેઢીનામાં બાબતે રૂબરૂ માં સહી કરનાર તલાટી કમ મંત્રી જવાબદાર નથી.</p>
          <p className="leading-[40px]"> ઉપર મુજબનું પેઢીનામું અમો પંચોના લખાવ્યા મુજબનું શુધ્ધ બુધ્ધિથી અકકલ હોશિયારીથી કોઈપણ જાતના દાબ-દબાણ લોભ-લાલચ સિવાયનું લખાવ્યા મુજબનું સાચું અને ખરું છે, જે અમોએ વાંચી સમજી સાંભળી વિચારીને નીચે સહી કરી આપેલ છે. જે મને કબૂલ મંજૂર છે.</p>
        </div>

        {/* Signature/Photo Area */}
        <div className="mt-4 sm:mt-6 text-black">
          <div className="flex flex-wrap justify-around">
            <div>
              <div className='flex items-center gap-2 text-black'>
                <p>સ્થળ:-</p>
                <div className="flex flex-col">
                  <div className="font-medium mx-auto -mb-1">{formData.moje}</div>
                  <div className="w-[100px] border-b-1 border-black mt-1"></div>
                </div>
              </div>
              <div className='flex items-center gap-2 text-black mt-3'>
                <p>તારીખ:-</p>
                <div className="w-[150px] h-[50px]">
                  <DatePicker
                    value={formData.date}
                    onChange={(value) => handleInputChange('date', value)}
                    label="તારીખ:-"
                  />
                </div>
              </div>
              <div className='text-black'>રૂબરૂ</div>
            </div>

            {/* panch signatures section */}
            <div className='flex flex-wrap gap-4'>
              <p className="mb-2 block text-xs sm:text-sm font-medium text-black">પંચો ની સહી</p>
              <div className="">
                {formData.panchDetails.map((sig, index) => (
                  <div key={index} className={`${index === 0 ? 'mt-0' : 'mt-2'}`}>
                    <p>{index + 1}.</p>
                    <div className="w-[200px] border-b-1 border-black mt-1"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* lakhavanar signatures section */}
            <div className='flex flex-col flex-wrap gap-4 mt-[7rem]'>
              <div className="w-[200px] border-b-1 border-black mt-1"></div>
              <p className="mb-2 block text-xs sm:text-sm font-medium text-black">લખાવનારની સહી</p>
            </div>
            <div>
              <div className='flex gap-4'>
                <div>
                  <PhotoUpload
                    value={formData.applicantPhoto}
                    onChange={(value) => handlePhotoChange('applicantPhoto', value)}
                    label="લખાવનારનો ફોટો"
                  />
                </div>
                <div>
                  <p className="mb-1 block text-xs sm:text-sm font-medium text-black">
                    અંગુઠાનું નિશાન
                  </p>
                  <div className="w-[200px] h-[70px] rounded-lg border-1 border-black mt-1"></div>
                </div>
              </div>
              <div className='mt-3'>
                <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">
                  આધાર કાર્ડ નંબર :
                </RequiredLabel>
                <input
                  type="text"
                  value={formData.applicantAadharNumber}
                  onChange={(e) => handleInputChange('applicantAadharNumber', e.target.value)}
                  onKeyDown={handleGujaratiInput}
                  onPaste={handleGujaratiPaste}
                  placeholder="આધાર કાર્ડ નંબર"
                  required
                  className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panch Response */}
      <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-black text-center leading-relaxed py-4">
          ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/જ. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું અંગેનું રૂબરૂ પંચનો જવાબ
        </h3>
        {/* Panch Details */}
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {formData.panchDetails.map((panch, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-3 sm:pb-4 relative"
            >
              {/* {formData.panchDetails.length > 1 && (
                <button
                  onClick={() => deletePanch(index)}
                  className="absolute top-0 right-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  aria-label="Delete panch"
                  title="Delete panch"
                >
                  <DeleteIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )} */}
              <div className="flex flex-wrap item-center justify-between">
                <div className='flex items-center w-[40%]'>
                  <h4 className="text-xs sm:text-sm font-semibold text-black mr-2">{index + 1}.</h4>
                  <RequiredLabel className="mb-1 block text-xs font-medium text-black">નામ</RequiredLabel>
                  <p className='text-black mx-2'> :-</p>
                  <input
                    type="text"
                    value={panch.name || ''}
                    onChange={(e) => handlePanchChange(index, 'name', e.target.value)}
                    placeholder="નામ"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
                <div className='flex items-center'>
                  <RequiredLabel className="mb-1 block text-xs font-medium text-black">ઉ.આ.વ</RequiredLabel>
                  <p className='text-black mx-2'> :-</p>
                  <input
                    type="text"
                    value={panch.income || ''}
                    onChange={(e) => handlePanchChange(index, 'income', e.target.value)}
                    placeholder="ઉ.આ.વ"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
                <div className='flex items-center'>
                  <RequiredLabel className="mb-1 block text-xs font-medium text-black">ધંધો</RequiredLabel>
                  <p className='text-black mx-2'> :-</p>
                  <select
                    value={panch.occupation || ''}
                    onChange={(e) => handlePanchChange(index, 'occupation', e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  >
                    <option value="">પસંદ કરો</option>
                    <option value="કૃષિ">કૃષિ</option>
                    <option value="વેપાર">વેપાર</option>
                    <option value="નોકરી">નોકરી</option>
                    <option value="વ્યવસાય">વ્યવસાય</option>
                    <option value="અન્ય">અન્ય</option>
                  </select>
                </div>
                <div className='flex'>
                  <RequiredLabel className="mb-1 block text-xs font-medium text-black">રહેવાસી</RequiredLabel>
                  <p className='text-black mx-2'> :-</p>
                  <input
                    type="text"
                    value={formData.moje}
                    onChange={(e) => handlePanchChange(index, 'resident', e.target.value)}
                    onKeyDown={handleGujaratiInput}
                    onPaste={handleGujaratiPaste}
                    placeholder="રહેવાસી"
                    required
                    readOnly
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm text-black">
          <p className="text-sm leading-[40px] inline mr-2">
            અમો નીચે સહી કરનાર પંચો આજરોજ રૂબરૂ હાજર થઈ લખાવીએ છીએ કે, અમો અરજદાર તથા તેમના કુટુંબીજનોને વારસદારોને સારી રીતે ઓળખીએ છીએ, અરજદારનો જવાબ અમારી રૂબરૂ લેવામાં આવ્યો છે. જેમાં તેમણે પાન નં. ૧ ઉપર લખાવેલ પેઢીનામાની ખાતરી કરતાં તેમાં દર્શાવેલ કૂલ
          </p>
          <input
            type="text"
            value={formData.hayatCount}
            onChange={(e) => handleInputChange('hayatCount', e.target.value)}
            placeholder="હયાત"
            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white mr-2 mb-0"
          />
          <span className="mr-2">હયાત +</span>
          <input
            type="text"
            value={formData.maranCount}
            onChange={(e) => handleInputChange('maranCount', e.target.value)}
            placeholder="મરણ"
            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white mr-2 mb-0"
          />
          <span className="mr-2">મરણ = એમ કુલ</span>
          <input
            type="text"
            value={formData.totalHeirs}
            onChange={(e) => handleInputChange('totalHeirs', e.target.value)}
            placeholder="કુલ વારસદાર"
            className="w-25 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white mr-2 mb-0"
          />
          <span className='leading-[40px]'>વારસદાર છે. જેમાં કોઈ કાયદેસરના વારસદારો લખવાના રહી જતા નથી ખોટું પેઢીનામું લખાવવું ફોજદારી ગુનો છે જેની અમોને સમજ છે.</span>
          <p className="text-sm leading-[40px] mb-0">
            ઉપર મુજબ નું પંચનામું અમો પંચોના લખાવ્યા મુજબનું શુધ્ધ બુધ્ધિથી અકકલ હોશિયારીથી કોઈપણ જાતના દાબ-દબાણ લોભ-લાલચ સિવાયનું લખાવ્યા મુજબનું સાચું અને ખરું છે, જે અમોએ વાંચી સમજી સાંભળી વિચારીને નીચે સહી કરી આપેલ છે, એ બરાબર છે.
          </p>
          <p className="text-xs sm:text-sm leading-[40px]">
            આ પેઢીનામું બનાવતી વખતે વારસદારોની ખાતરી કરવા અંગે જરૂરી સાધનિક પુરાવા રજુ થયેલ નથી. જેની આ પેઢીનામું નિણાયર્ક પુરાવા તરીકે ગણાશે નહી. અને જે કચેરીમાં રજુ થાય તે કચેરીના અધિકારીશ્રીઓએ આ પેઢીનામાની જરૂર જણાયે વારસદાર અંગે સાધનિક પુરાવાની ખાતરી કરવાની રહેશે. આ પેઢીનામામાં અરજદારે અથવા અમે પંચો કોઈ હકીકત છૂપાવ્યાનું જાહેર થશે તો આ પેઢીનામું આપોઆપ રદ થયેલ ગણાશે. ખોટી હકીકત લખાવવી, અને સાચી હકીકત છૂપાવવી તે ફોજદારી ગુન્હો બને છે જેની અમોને જાણ છે. જે અમોને વાંચી, વંચાવી, સાંભળી અને વિચારીને સહી કરેલ છે. જે અમોને કબુલ મંજુર છે.
          </p>
        </div>

        {/* Witness Photo and Signature Sections */}
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 flex flex-wrap gap-4">
          {formData.panchDetails.map((panch, index) => (
            <div key={`panch_details_${index}`} className="border-b border-gray-200 pb-3 sm:pb-4 flex items-center gap-4 relative">
              {formData.panchDetails.length > 1 && (
                <button
                  onClick={() => deletePanch(index)}
                  className="absolute top-0 right-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors z-10"
                  aria-label="Delete panch"
                  title="Delete panch"
                >
                  <DeleteIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
                <div>
                  <PhotoUpload
                    value={panch.photo || ''}
                    onChange={(value) => handlePanchPhotoChange(index, value)}
                    label="પંચનો ફોટો"
                    width="200px"
                    height="200px"
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <p className="mb-1 block text-xs sm:text-sm text-black">
                    અંગુઠાનું નિશાન
                  </p>
                  <div className="w-[200px] h-[70px] rounded-lg border-1 border-black mt-1"></div>
                  <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-black">પંચ-{index + 1}</h4>
                  <div className="w-[200px] border-b-1 border-black mt-1"></div>
                  <RequiredLabel className="mb-1 block text-xs sm:text-sm text-black">
                    આધારકાર્ડ નં:
                  </RequiredLabel>
                  <input
                    type="text"
                    value={panch.aadhar}
                    onChange={(e) => handlePanchChange(index, 'aadhar', e.target.value)}
                    onKeyDown={handleGujaratiInput}
                    onPaste={handleGujaratiPaste}
                    placeholder="આધારકાર્ડ નં."
                    required
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
              </div>
          ))}
          {formData.panchDetails.length < 5 && 
            <button
              onClick={addPanch}
              className="flex items-center gap-2 rounded-lg bg-yellow-500 px-3 sm:px-4 py-2 text-sm sm:text-base text-white hover:bg-yellow-600"
            >
              <span>+</span>
              <span>Add Panch</span>
            </button>
          }
        </div>


        <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <RequiredLabel className="mb-1 block text-sm font-medium text-black">સ્થળ</RequiredLabel>
            <input
              type="text"
              value={formData.finalPlace}
              onChange={(e) => handleInputChange('finalPlace', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="સ્થળ"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
          </div>
          <div>
            <DatePicker
              value={formData.finalDate}
              onChange={(value) => handleInputChange('finalDate', value)}
              label="તારીખ"
            />
          </div>
        </div>
      </div>

      {/* Final Section */}
      <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-black">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 mb-3 sm:mb-4">
            <div>
              <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">સ્થળ:-</RequiredLabel>
              <input
                type="text"
                value={formData.finalPlace}
                onChange={(e) => handleInputChange('finalPlace', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="સ્થળ"
                required
                className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div>
              <DatePicker
                value={formData.finalDate}
                onChange={(value) => handleInputChange('finalDate', value)}
                label="તારીખ:-"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
            <span>આ પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ</span>
            <DatePicker
              value={formData.applicationDate}
              onChange={(value) => handleInputChange('applicationDate', value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
            <span className="flex-1">ના રોજ નોટરી શ્રી</span>
            <input
              type="text"
              value={formData.notaryName}
              onChange={(e) => handleInputChange('notaryName', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="નોટરી નામ"
              required
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-2 py-1 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
            <span>રજી નં.</span>
            <input
              type="text"
              value={formData.regNo}
              onChange={(e) => handleInputChange('regNo', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="રજી નં."
              required
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-2 py-1 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
            <span>ના સિ.નં.</span>
            <input
              type="text"
              value={formData.serialNo}
              onChange={(e) => handleInputChange('serialNo', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="ના સિ.નં."
              required
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-2 py-1 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
            <span>તારીખ</span>
            <DatePicker
              value={formData.notaryDate}
              onChange={(value) => handleInputChange('notaryDate', value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="flex items-start sm:items-center gap-2">
            <span className="flex-1">
              થી કરેલ સોગંદનામું/સ્વઘોષણા તથા પંચોના લખાવ્યા મુજબ તૈયાર કરેલ છે
            </span>
          </div>
          <p className="font-medium text-xs sm:text-sm">
            વારસદારોની ખોટા ખરા અંગે સબંધિત તલાટી કમ મંત્રીશ્રી જવાબદાર નથી.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
            <span>આ પેઢીનામું</span>
            <input
              type="text"
              value={formData.pedhinamuPurposeFinal}
              onChange={(e) => handleInputChange('pedhinamuPurposeFinal', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="ના કામે"
              required
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-2 py-1 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
            <span>ના કામે ઉપયોગ કરી શકાશે.</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">
            સદર પેઢીનામું વારસાઇ પ્રમાણપત્ર કે પ્રોબ્રેટ નથી પેઢીનામાંમા માત્ર રૂબરૂ જવાબ પંચોનું પંચનામું સામેલ છે વારસદારો અંગે સાંધનિક પુરાવાની ખાત્રી અલગથી કરવાની રહેશે, આ પેઢીનામાંમા દર્શાવેલા વારસદારો અંગે કોઈ વિવાદ થશે તો કોર્ટનું વારસાઈ સર્ટીફીકેટ આખરી ગણાશે.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 mt-3 sm:mt-4">
            <div>
              <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">
                અરજદાર ની સહિ.
              </RequiredLabel>
              <input
                type="text"
                value={formData.applicantSignature}
                onChange={(e) => handleInputChange('applicantSignature', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="અરજદાર ની સહિ"
                required
                className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div>
              <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">રૂબરૂ</RequiredLabel>
              <input
                type="text"
                value={formData.inPerson}
                onChange={(e) => handleInputChange('inPerson', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="રૂબરૂ"
                required
                className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-start pb-4 sm:pb-8">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white hover:bg-yellow-700"
        >
          <PrintIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>પ્રિન્ટ</span>
        </button>
      </div>
    </div>
  );
}

