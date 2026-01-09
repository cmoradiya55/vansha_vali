'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import FamilyTree from '@/components/FamilyTree';
import PhotoUpload from '@/components/PhotoUpload';
import { generatePDF } from '@/utils/pdfGenerator';
// Simple SVG Icon Components for website
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

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

interface FamilyMember {
  id: string;
  name: string;
  age?: string;
  relation?: string;
  hayat?: string;
  birth?: string;
  death?: string;
  children: FamilyMember[];
}

interface PanchDetail {
  name: string;
  age: string;
  resident: string;
  aadhar: string;
  income?: string;
  occupation?: string;
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

export default function MaranPage() {
  const [formData, setFormData] = useState({
    moje: '',
    taluko: '',
    jillo: '',
    applicantDate: '',
    applicantDistrict: '',
    applicantResident: '',
    applicantTaluko: '',
    relationToDeceased: '',
    deceasedRelation: '',
    deathPlace: '',
    deathDate: '',
    pedhinamuPurpose: '',
    pedhinamuDate: '',
    applicationDate: '',
    place: '',
    date: '',
    declarantSignature: '',
    thumbImpression: '',
    aadharNumber: '',
    panchSignatures: ['', '', ''],
    panchPhoto: '',
    panchDetails: [
      { name: '', age: '', resident: '', aadhar: '', income: '', occupation: '' },
      { name: '', age: '', resident: '', aadhar: '', income: '', occupation: '' },
      { name: '', age: '', resident: '', aadhar: '', income: '', occupation: '' },
    ] as PanchDetail[],
    panchMoje: '',
    panchTaluko: '',
    panchJillo: '',
    hayatCount: '',
    maranCount: '',
    totalHeirs: '',
    finalPlace: '',
    finalDate: '',
    notaryDate: '',
    notaryName: '',
    regNo: '',
    serialNo: '',
    affidavitCheckbox: false,
    pedhinamuPurposeFinal: '',
    applicantSignature: '',
    inPerson: '',
    panchThumbImpression: ['', '', ''],
    applicantName: '',
    preparerPhoto: '',
    // thumbImpression: '',
    panchPhotos: ['', '', ''],
    panchThumbImpressions: ['', '', ''],
  });

  const [familyTree, setFamilyTree] = useState<FamilyMember[]>([]);

  const handlePhotoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePanchPhotoChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newPhotos = [...prev.panchPhotos];
      newPhotos[index] = value;
      return { ...prev, panchPhotos: newPhotos };
    });
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-fill taluka and jillo when moje is selected
      if (field === 'moje' && value && locationData[value]) {
        updated.taluko = locationData[value].taluka;
        updated.jillo = locationData[value].jillo;
      }
      
      // Auto-fill panch taluka and jillo when panch moje is selected
      if (field === 'panchMoje' && value && locationData[value]) {
        updated.panchTaluko = locationData[value].taluka;
        updated.panchJillo = locationData[value].jillo;
      }
      
      return updated;
    });
  };

  const handlePanchChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newPanch = [...prev.panchDetails];
      newPanch[index] = { ...newPanch[index], [field]: value };
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

  const handlePrint = () => {
    const pdfData = {
      ...formData,
      familyTree: flattenFamilyTree(familyTree),
    };
    generatePDF(pdfData, true);
  };

  const flattenFamilyTree = (members: FamilyMember[]): any[] => {
    const result: any[] = [];
    const traverse = (member: FamilyMember) => {
      result.push({
        name: member.name,
        age: member.age,
        relation: member.relation,
        birth: member.birth,
        death: member.death,
      });
      member.children.forEach(traverse);
    };
    members.forEach(traverse);
    return result;
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-2 sm:px-4">
        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-black">મરણ</h1>
          <h2 className="text-lg sm:text-xl font-semibold text-black mt-2">મરણ પેઢીનામું</h2>
        </div>

        {/* Reference */}
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 sm:p-4 text-xs sm:text-sm">
          <p className="text-center text-black leading-relaxed">
            ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/જ. તા. ૧૪/૦૫/૨૦૧૪
            મુજબનું પેઢીનામું
          </p>
        </div>

        {/* Applicant Response Section */}
        <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
          <div className="mb-3 sm:mb-4 rounded-lg bg-yellow-100 px-3 sm:px-4 py-2">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-800">અરજદારોનો જવાબ</h3>
          </div>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-black">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-end gap-2">
              <p className="font-medium">હું નીચે સહી કરનાર</p>
              <div className="flex flex-col items-center w-full sm:min-w-[200px] sm:max-w-[300px]">
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  placeholder="નામ"
                  className="w-full text-center border-none border-b-2 border-black bg-transparent focus:outline-none focus:border-yellow-500 text-black pb-1 text-sm sm:text-base"
                />
                <div className="w-full border-b-2 border-black mt-1"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-black">ઉ.વ.આ.</label>
                <input
                  type="text"
                  value={formData.applicantDate}
                  onChange={(e) => handleInputChange('applicantDate', e.target.value)}
                  placeholder="ઉ.વ.આ."
                  className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-black">રહેવાસી</label>
                <input
                  type="text"
                  value={formData.applicantResident}
                  onChange={(e) => handleInputChange('applicantResident', e.target.value)}
                  placeholder="રહેવાસી"
                  className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium text-black">તાલુકો:</label>
                <input
                  type="text"
                  value={formData.applicantTaluko}
                  onChange={(e) => handleInputChange('applicantTaluko', e.target.value)}
                  placeholder="તાલુકો"
                  className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm">આજ રોજ રૂબરૂ હાજર થઇ પુછવાની લખાવું છૂ કે,</p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
              <span>કે જેઓ મારા</span>
              <input
                type="text"
                value={formData.relationToDeceased}
                onChange={(e) => handleInputChange('relationToDeceased', e.target.value)}
                placeholder="સબંધ"
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>થાય. તેઓનું</span>
              <input
                type="text"
                value={formData.deceasedRelation}
                onChange={(e) => handleInputChange('deceasedRelation', e.target.value)}
                placeholder="નામ"
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">મુકામે</label>
                <input
                  type="text"
                  value={formData.deathPlace}
                  onChange={(e) => handleInputChange('deathPlace', e.target.value)}
                  placeholder="મુકામે"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">તારીખ</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.deathDate}
                    onChange={(e) => handleInputChange('deathDate', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <p className="mt-2">ના રોજ અવસાન થયેલું છે.</p>
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4" 
              />
              <span>ના કામે તેમના પેઢીનામાની જરૂર</span>
              <input
                type="text"
                value={formData.pedhinamuPurpose}
                onChange={(e) => handleInputChange('pedhinamuPurpose', e.target.value)}
                placeholder="કામ"
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>હોઇ પેઢીનામું મેળવવા માટે તા.</span>
              <input
                type="date"
                value={formData.pedhinamuDate}
                onChange={(e) => handleInputChange('pedhinamuDate', e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>ના રોજ અરજી કરેલી છે. તે સંદર્ભે આજ રોજ લખાવું છૂ કે, ગુજરનારના વારસદારો જાહેર કરતું પેઢીનામું નીચે પ્રમાણે છે. જે હકીક્ત છે.</span>
            </div>
          </div>
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium text-black">મોજે ?</label>
            <select
              value={formData.moje}
              onChange={(e) => handleInputChange('moje', e.target.value)}
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
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium text-black">તાલુકો :</label>
            <input
              type="text"
              value={formData.taluko}
              onChange={(e) => handleInputChange('taluko', e.target.value)}
              placeholder="તાલુકો"
              className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium text-black">જીલ્લો :</label>
            <input
              type="text"
              value={formData.jillo}
              onChange={(e) => handleInputChange('jillo', e.target.value)}
              placeholder="જીલ્લો"
              className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
          </div>
        </div>

        {/* Family Tree */}
        <div className="rounded-lg border border-gray-300 bg-white p-2 sm:p-4">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-black">પેઢીનામું</h3>
          <FamilyTree members={familyTree} onChange={setFamilyTree} showBirthDeath={true} />
        </div>

        {/* Declaration Section */}
        <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-black">
            <p className="leading-relaxed">
              ઉપર પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદાર તથા પંચોના લખાવ્યા મુજબનું બરાબર છે. અને જો આ પેઢીનામું ખોટું કરે તેમાં અમો અરજદાર તથા પંચો જવાબદાર છીએ. સદર પેઢીનામામાં અમો અરજદાર કે પંચોને કોઇ ખોટા વારસદારો આવેલા નથી કે સાચા વારસદારો બતાવવાના બાકી રાખેલા નથી. ખોટું પેઢીનામું લખાવવું ફોજદારી ગુન્હો છે. જેની અમોને સમજ છે. આ બાબતે તલાટીની લેશ માત્ર જવાબદાર નથી કે આ અંગે તેઓની કોઈ જવાબદારી નથી.
            </p>
            <p className="leading-relaxed">
              ઉપર મુજબનું પેઢીનામું, જવાબ મારી શુદ્ધ બુદ્ધિથી, અકકલ હોશિયારીથી, કોઇપણ જાતના દાબ-દબાણ, લોભ-લાલચ સિવાયનો લખાવ્યા મુજબનો સાચો અને ખરો છે. જે મે વાંચી, સમજી, સાંભળી વિચારીને સહી કરેલ છે. જે બરાબર છે.
            </p>
            <p className="leading-relaxed">
              ઉપર પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદારના રૂબરૂ જવાબ, તા.
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => handleInputChange('applicationDate', e.target.value)}
                className="mx-1 sm:mx-2 rounded-lg border border-gray-300 px-1 sm:px-2 py-1 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              ના સોગંદનામા,રજુ કરેલ સાઘનિક તથા પંચોના લખાવ્યા મુજબનું તૈયાર કરી આપેલ છે. જેમાં તલાટીશ્રી જવાબદાર નથી.
            </p>
          </div>

          {/* Signature/Photo Area */}
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">સ્થળ:</label>
                <input
                  type="text"
                  value={formData.place}
                  onChange={(e) => handleInputChange('place', e.target.value)}
                  placeholder="સ્થળ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">તારીખ:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black">રૂબરૂ</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {[1, 2, 3].map((num) => (
                  <input
                    key={num}
                    type="text"
                    placeholder={`${num}`}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black">પંચો ની સહી</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {formData.panchSignatures.map((sig, index) => (
                  <input
                    key={index}
                    type="text"
                    value={sig}
                    onChange={(e) => {
                      const newSigs = [...formData.panchSignatures];
                      newSigs[index] = e.target.value;
                      setFormData((prev) => ({ ...prev, panchSignatures: newSigs }));
                    }}
                    placeholder={`${index + 1}`}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                લખાવનારની સહી
              </label>
              <input
                type="text"
                value={formData.declarantSignature}
                onChange={(e) => handleInputChange('declarantSignature', e.target.value)}
                placeholder="લખાવનારની સહી"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-black">
                અંગુઠાનું નિશાન
              </label>
              <input
                type="text"
                value={formData.thumbImpression}
                onChange={(e) => handleInputChange('thumbImpression', e.target.value)}
                placeholder="અંગુઠાનું નિશાન"
                className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <PhotoUpload
                  value={formData.preparerPhoto}
                  onChange={(value) => handlePhotoChange('preparerPhoto', value)}
                  label="પેઢીનામું તૈયાર કરવાનારનો ફોટો"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  આધાર કાડૅ નંબર :
                </label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  placeholder="આધાર કાર્ડ નંબર"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panch Response */}
        <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
          <div className="mb-3 sm:mb-4 rounded-lg bg-yellow-100 px-3 sm:px-4 py-2">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-yellow-800 leading-relaxed">
              ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/જ. તા. ૧૪/૦૫/૨૦૧૪
              મુજબનું પેઢીનામું અંગેનું રૂબરૂ પંચનો જવાબ
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">મોજે</label>
              <select
                value={formData.panchMoje}
                onChange={(e) => handleInputChange('panchMoje', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
              >
                <option value="">મોજે પસંદ કરો</option>
                {Object.keys(locationData).map((moje) => (
                  <option key={moje} value={moje}>
                    {moje}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">તાલુકો</label>
              <input
                type="text"
                value={formData.panchTaluko}
                onChange={(e) => handleInputChange('panchTaluko', e.target.value)}
                placeholder="તાલુકો"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">જીલ્લો</label>
              <input
                type="text"
                value={formData.panchJillo}
                onChange={(e) => handleInputChange('panchJillo', e.target.value)}
                placeholder="જીલ્લો"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
          </div>

          {/* Panch Details */}
          <div className="mt-4 space-y-4">
            {formData.panchDetails.slice(0, 3).map((panch, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-4"
              >
                <h4 className="mb-3 text-sm font-semibold text-black">{index + 1}.</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-black">ઉ.આવ</label>
                    <input
                      type="text"
                      value={panch.income || ''}
                      onChange={(e) => handlePanchChange(index, 'income', e.target.value)}
                      placeholder="ઉ.આવ"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-black">ધંધો</label>
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
                  <div>
                    <label className="mb-1 block text-xs font-medium text-black">રહેવાસી</label>
                    <input
                      type="text"
                      value={panch.resident}
                      onChange={(e) => handlePanchChange(index, 'resident', e.target.value)}
                      placeholder="રહેવાસી"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 text-sm text-black">
            <p className="font-medium leading-relaxed">
            અમો નીચે સહી કરનાર પંચો આજરોજ રૂબરૂ હાજર થઈ લખાવીએ છીએ કે, અમો અરજદાર તથા તેમના કુટુંબીજનોને વારસદારોને સારી રીતે ઓળખીએ છીએ, અરજદારનો જવાબ અમારી રૂબરૂ લેવામાં આવ્યો છે. જેમાં તેમણે પાન નં. ૧ ઉપર લખાવેલ પેઢીનામાની ખાતરી કરતાં તેમાં દર્શાવેલ કૂલ
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span>હયાત</span>
              <input
                type="text"
                value={formData.hayatCount}
                onChange={(e) => handleInputChange('hayatCount', e.target.value)}
                placeholder="હયાત"
                className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>+</span>
              <span>મરણ</span>
              <input
                type="text"
                value={formData.maranCount}
                onChange={(e) => handleInputChange('maranCount', e.target.value)}
                placeholder="મરણ"
                className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>=</span>
              <span>એમ કુલ</span>
              <input
                type="text"
                value={formData.totalHeirs}
                onChange={(e) => handleInputChange('totalHeirs', e.target.value)}
                placeholder="કુલ વારસદાર"
                className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>વારસદાર છે. જેમાં કોઈ કાયદેસરના વારસદારો લખવાના રહી જતા નથી ખોટું પેઢીનામું લખાવવું ફોજદારી ગુનો છે જેની અમોને સમજ છે.</span>
            </div>
            <p className="leading-relaxed">
              ઉપર મુજબ નું પંચનામું અમો પંચોના લખાવ્યા મુજબનું શુધ્ધ બુધ્ધિથી અકકલ હોશિયારીથી કોઈપણ જાતના દાબ-દબાણ લોભ-લાલચ સિવાયનું લખાવ્યા મુજબનું સાચું અને ખરું છે, જે અમોએ વાંચી સમજી સાંભળી વિચારીને નીચે સહી કરી આપેલ છે, એ બરાબર છે.
            </p>
            <p className="leading-relaxed">
              આ પેઢીનામું બનાવતી વખતે વારસદારોની ખાતરી કરવા અંગે જરૂરી સાધનિક પુરાવા રજુ થયેલ નથી. જેની આ પેઢીનામું નિણાયર્ક પુરાવા તરીકે ગણાશે નહી. અને જે કચેરીમાં રજુ થાય તે કચેરીના અધિકારીશ્રીઓએ આ પેઢીનામાની જરૂર જણાયે વારસદાર અંગે સાધનિક પુરાવાની ખાતરી કરવાની રહેશે. આ પેઢીનામામાં અરજદારે અથવા અમે પંચો કોઈ હકીકત છૂપાવ્યાનું જાહેર થશે તો આ પેઢીનામું આપોઆપ રદ થયેલ ગણાશે. ખોટી હકીકત લખાવવી, અને સાચી હકીકત છૂપાવવી તે ફોજદારી ગુન્હો બને છે જેની અમોને જાણ છે. જે અમોને વાંચી, વંચાવી, સાંભળી અને વિચારીને સહી કરેલ છે. જે અમોને કબુલ મંજુર છે.
            </p>
          </div>

          {/* Witness Photo and Signature Sections */}
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {formData.panchDetails.map((panch, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 sm:pb-4">
                <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-black">પંચ-{index + 1} )</h4>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium text-black">
                      અંગુઠાનું નિશાન
                    </label>
                    <input
                      type="text"
                      value={formData.panchThumbImpressions[index] || ''}
                      onChange={(e) => {
                        const newThumbs = [...formData.panchThumbImpressions];
                        newThumbs[index] = e.target.value;
                        setFormData(prev => ({ ...prev, panchThumbImpressions: newThumbs }));
                      }}
                      placeholder="અંગુઠાનું નિશાન"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                    />
                  </div>
                  <div>
                    <PhotoUpload
                      value={formData.panchPhotos[index] || ''}
                      onChange={(value) => handlePanchPhotoChange(index, value)}
                      label="પંચનો ફોટો"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium text-black">
                      આધારકાર્ડ નં:
                    </label>
                    <input
                      type="text"
                      value={panch.aadhar}
                      onChange={(e) => handlePanchChange(index, 'aadhar', e.target.value)}
                      placeholder="આધારકાર્ડ નં."
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs sm:text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addPanch}
              className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
            >
              <span>+</span>
              <span>Add Panch</span>
            </button>
          </div>
        </div>

        {/* Final Section */}
        <div className="rounded-lg border border-gray-300 bg-white p-4">
          <div className="space-y-4 text-sm text-black">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">સ્થળ:-</label>
                <input
                  type="text"
                  value={formData.finalPlace}
                  onChange={(e) => handleInputChange('finalPlace', e.target.value)}
                  placeholder="સ્થળ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">તારીખ:-</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.finalDate}
                    onChange={(e) => handleInputChange('finalDate', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <p>
              આ પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4" 
              />
              <span>ના રોજ નોટરી શ્રી</span>
              <input
                type="text"
                value={formData.notaryName}
                onChange={(e) => handleInputChange('notaryName', e.target.value)}
                placeholder="નોટરી નામ"
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>રજી નં.</span>
              <input
                type="text"
                value={formData.regNo}
                onChange={(e) => handleInputChange('regNo', e.target.value)}
                placeholder="રજી નં."
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>ના સિ.નં.</span>
              <input
                type="text"
                value={formData.serialNo}
                onChange={(e) => handleInputChange('serialNo', e.target.value)}
                placeholder="ના સિ.નં."
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>તારીખ</span>
              <input
                type="date"
                value={formData.notaryDate}
                onChange={(e) => handleInputChange('notaryDate', e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.affidavitCheckbox}
                onChange={(e) => setFormData(prev => ({ ...prev, affidavitCheckbox: e.target.checked }))}
                className="h-4 w-4" 
              />
              <span>
                થી કરેલ સોગંદનામું/સ્વઘોષણા તથા પંચોના લખાવ્યા મુજબ તૈયાર કરેલ છે
              </span>
            </div>
            <p className="font-medium">
              વારસદારોની ખોટા ખરા અંગે સબંધિત તલાટી કમ મંત્રીશ્રી જવાબદાર નથી.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span>આ પેઢીનામું</span>
              <input
                type="text"
                value={formData.pedhinamuPurposeFinal}
                onChange={(e) => handleInputChange('pedhinamuPurposeFinal', e.target.value)}
                placeholder="ના કામે"
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
              <span>ના કામે ઉપયોગ કરી શકાશે.</span>
            </div>
            <p className="text-sm leading-relaxed">
              સદર પેઢીનામું વારસાઇ પ્રમાણપત્ર કે પ્રોબ્રેટ નથી પેઢીનામાંમા માત્ર રૂબરૂ જવાબ પંચોનું પંચનામું સામેલ છે વારસદારો અંગે સાંધનિક પુરાવાની ખાત્રી અલગથી કરવાની રહેશે, આ પેઢીનામાંમા દર્શાવેલા વારસદારો અંગે કોઈ વિવાદ થશે તો કોર્ટનું વારસાઈ સર્ટીફીકેટ આખરી ગણાશે.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  અરજદાર ની સહિ,
                </label>
                <input
                  type="text"
                  value={formData.applicantSignature}
                  onChange={(e) => handleInputChange('applicantSignature', e.target.value)}
                  placeholder="અરજદાર ની સહિ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">રૂબરૂ</label>
                <input
                  type="text"
                  value={formData.inPerson}
                  onChange={(e) => handleInputChange('inPerson', e.target.value)}
                  placeholder="રૂબરૂ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none text-black bg-white"
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
    </Layout>
  );
}
