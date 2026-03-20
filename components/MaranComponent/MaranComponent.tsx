'use client';

import { useState, useEffect, useMemo } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import CustomSelect from '@/components/CustomSelect';
import DatePicker from '@/components/DatePicker';
import RequiredLabel from '@/components/RequiredLabel';
import { handleGujaratiInput, handleGujaratiPaste, filterGujaratiOnly, toGujaratiDigits, toEnglishDigits, normalizeAadharInput, handleAadharKeyDown } from '@/utils/gujaratiInputValidator';
import DeleteIcon from '@/public/custom-icon/all-icons/DeleteIcon';
import FamilyTree from '@/components/MaranComponent/MaranFamilyTree';
import { generateMaranPDF } from './MaranPdfGenerator';
import { useAuth } from '@/context/AuthContext';

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

// locationData is now built dynamically from the user's Firestore villages array

const defaultMember: FamilyMember = {
  id: Date.now().toString(),
  name: '',
  age: '',
  relation: '',
  hayat: 'મરણ',
  birth: '',
  death: '',
  deathDateType: 'tarikh',
  deathAashre: '',
  children: [
    {
      id: (Date.now() + 1).toString(),
      name: '',
      age: '',
      relation: '',
      hayat: 'હયાત',
      birth: '',
      death: '',
      deathDateType: 'tarikh',
      deathAashre: '',
      children: [],
    },
    // {
    //   id: (Date.now() + 2).toString(),
    //   name: '',
    //   age: '',
    //   relation: '',
    //   hayat: 'હયાત',
    //   birth: '',
    //   death: '',
    //   deathDateType: 'tarikh',
    //   deathAashre: '',
    //   children: [],
    // }
  ],
};

export default function MaranComponent() {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const locationData = useMemo(() => {
    const map: Record<string, { taluka: string; jillo: string }> = {};
    if (user?.villages) {
      user.villages.forEach((v) => {
        map[v.village] = { taluka: v.taluko, jillo: v.district };
      });
    }
    return map;
  }, [user?.villages]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatted = now.toLocaleDateString('gu-IN', options);
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    age: '',
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
    mukameDateType: 'tarikh',
    mukameAashre: '',
    rehevaasi: '',
    rehevaasicustom: '',
    deceasedName: '',
    deceasedRelation: '',
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

  const [familyTree, setFamilyTree] = useState<FamilyMember[]>([defaultMember]);

  const handleMainMemberChange = (field: string, value: string) => {
    setFamilyTree((prev) => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      return [{ ...first, [field]: value }, ...rest];
    });
  };

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

      if (field === 'moje' && filteredValue && locationData[filteredValue]) {
        updated.taluko = locationData[filteredValue].taluka;
        updated.jillo = locationData[filteredValue].jillo;
      }
      return updated;
    });
  };

  const handleDownloadTemplatePDF = async () => {
    if (isGeneratingPDF) return; // Prevent multiple clicks

    setIsGeneratingPDF(true);

    try {
      const mainMember = familyTree[0];
      const templateData = {
        jillo: formData.jillo || '',
        kamakNo: '',
        date: formData.date || '',
        applicationDate: formData.applicationDate || '',
        applicantLocation: formData.moje || '',
        applicantTaluka: formData.taluko || '',
        applicantJillo: formData.jillo || '',
        applicantName: formData.applicantName || '',
        applicantAge: formData.age || '',
        applicantGender: '',
        applicantResident: formData.rehevaasi === 'અન્ય'
          ? (formData.rehevaasicustom || formData.moje || '')
          : (formData.rehevaasi || formData.moje || ''),
        applicantPhoto: formData.applicantPhoto || '',
        applicantSignature: formData.applicantSignature || '',
        applicantAadharNumber: formData.applicantAadharNumber || '',
        purpose: formData.pedhinamuPurpose || '',
        documentDate: formData.pedhinamuDate || '',

        // Maran-specific fields
        deceasedName: formData.deceasedName || '',
        deceasedRelation: formData.deceasedRelation || '',
        rehevaasi: formData.rehevaasi === 'અન્ય'
          ? (formData.rehevaasicustom || '')
          : (formData.rehevaasi || ''),
        deathDateType: mainMember?.deathDateType || 'tarikh',
        deathDate: mainMember?.death || '',
        deathAashre: mainMember?.deathAashre || '',
        pedhinamuPurposeFinal: formData.pedhinamuPurposeFinal || '',

        familyTree: familyTree || [],
        familyMembers: (familyTree || []).map((m) => ({
          id: m.id,
          name: m.name,
          relation: m.relation || '',
          address: '',
          gender: '',
          resident: formData.moje || '',
          photo: undefined,
          signature: undefined,
        })),
        panchMembers: (formData.panchDetails || []).map((p) => ({
          name: p.name || '',
          photo: p.photo || '',
          signature: undefined,
          aadharNumber: p.aadhar || '',
          age: p.age || '',
          income: p.income || '',
          occupation: p.occupation || '',
          resident: p.resident || formData.moje || '',
          aadhar: p.aadhar || '',
        })),
        hayatCount: formData.hayatCount || '',
        maranCount: formData.maranCount || '',
        totalHeirs: formData.totalHeirs || '',
        finalLocation: formData.finalPlace || formData.moje || '',
        finalDate: formData.finalDate || '',
        notaryDate: formData.notaryDate || '',
        notaryName: formData.notaryName || '',
        notaryAddress: '',
        notaryRegNo: formData.regNo || '',
        serialNo: formData.serialNo || '',
      };

      const result = await generateMaranPDF(templateData);

      // if (result.success) {
      //   if (result.platform === 'mobile') {
      //     alert('✅ PDF સફળતાપૂર્વક બનાવવામાં આવ્યું છે અને શેર કરવા માટે તૈયાર છે!');
      //   } else {
      //     alert('✅ PDF સફળતાપૂર્વક ડાઉનલોડ થઈ ગયું છે!');
      //   }
      // } else {
      //   alert('❌ PDF બનાવવામાં ભૂલ આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
      //   console.error('PDF generation error:', result.error);
      // }
    } catch (error) {
      alert('❌ PDF બનાવવામાં ભૂલ આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
      console.error('Error in handleDownloadTemplatePDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
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

  return (
    <div id="pedhinama" className="mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Header */}
      {/* Header with Title and Date/Time */}
      <div className="flex justify-center items-center mb-4 sm:mb-6 pb-2">
        <h1 className="text-lg sm:text-xl font-bold text-black pt-4">મરણ</h1>
      </div>
      <div className="relative flex bg-white px-3 py-2 items-center">

        {/* Left side */}
        <span className="shrink-0 rounded-lg border border-gray-400 bg-gray-100 px-2 py-0.5 text-xs sm:text-sm font-semibold text-black whitespace-nowrap">
          અરજદારનો જવાબ
        </span>

        {/* Center text */}
        <p className="absolute left-1/2 -translate-x-1/2 text-xs sm:text-sm text-black leading-relaxed text-center">
          ગુજરાત સરકાર મહેસુલ વિભાગના પરિપત્ર ક્રમાંક : હકપ/૧૦૨૦૧૪/૭૫૬/૪. તા. ૧૪/૦૫/૨૦૧૪ મુજબનું પેઢીનામું
        </p>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-2 sm:p-3">
        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-xs sm:text-sm text-black declaration-flow leading-7">
          <span>હું નીચે સહિ કરનાર </span>
          <div className="inline-flex min-w-[250px] max-w-[500px]">
            <input
              type="text"
              value={formData.applicantName}
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^[A-Za-z\u0A80-\u0AFF\s]*$/;
                if (regex.test(value)) {
                  handleInputChange('applicantName', value);
                }
              }}
              placeholder="નામ"
              required
              className="w-full text-black bg-transparent border-0 border-b border-black focus:outline-none text-xs sm:text-sm text-center placeholder:text-center"
            />
          </div>
          <span>ઉ.વ.આ.</span>
          <div className="inline-flex min-w-[120px] max-w-[200px]">
            <input
              type="text"
              value={formData.age}
              onChange={(e) => {
                const value = e.target.value;

                // allow only digits
                if (/^\d*$/.test(value)) {
                  handleInputChange('age', value);
                }
              }}
              placeholder="ઉંમર"
              className="w-full text-black bg-transparent border-0 border-b border-black focus:outline-none text-xs sm:text-sm text-center placeholder:text-center"
            />
          </div>
          <span> રહેવાસી </span>
          <div className="inline-flex min-w-[200px] max-w-[450px]">
            <select
              value={formData.rehevaasi}
              onChange={(e) => handleInputChange('rehevaasi', e.target.value)}
              className="w-full border-0 border-b border-black bg-transparent text-black text-xs sm:text-sm focus:outline-none cursor-pointer appearance-none "
            >
              <option value="">પસંદ કરો</option>
              {Object.keys(locationData).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
              <option value="અન્ય">અન્ય</option>
            </select>
          </div>
          {formData.rehevaasi === 'અન્ય' && (
            <div className="inline-flex min-w-[250px] max-w-[450px]">
              <input
                type="text"
                value={formData.rehevaasicustom}
                onChange={(e) =>
                  handleInputChange('rehevaasicustom', e.target.value)
                }
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="રહેવાસી"
                className="w-full text-black bg-transparent border-0 border-b border-black focus:outline-none text-xs sm:text-sm text-center"
              />
            </div>
          )}
          <span> તાલુકો: </span>
          <div className="flex flex-col inline-flex items-start declaration-value">
            <span className="font-medium -mb-0.5 text-left min-w-[4rem]">{formData.rehevaasi}</span>
            <div className="w-20 border-b border-black mt-0.5"></div>
          </div>
          <span> આજ રોજ રૂબરૂ હાજર થઇ પુછવાની લખાવું છૂ કે, </span>
          <div className="flex flex-col items-start inline-flex min-w-[100px] max-w-[160px] shrink-0">
            <input
              type="text"
              value={formData.deceasedName}
              onChange={(e) => handleInputChange('deceasedName', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="નામ"
              className="input-name w-full -mb-0.5 text-left text-black pb-0.5 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none"
            />
          </div>
          <span> કે જેઓ મારા </span>
          <div className="flex flex-col items-start inline-flex min-w-[100px] max-w-[160px] shrink-0">
            <input
              type="text"
              value={formData.deceasedRelation}
              onChange={(e) => handleInputChange('deceasedRelation', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="સંબંધ"
              className="input-name w-full -mb-0.5 text-left text-black pb-0.5 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none"
            />
          </div>
          <span> થાય. તેઓનું </span>
          <div className="flex flex-col items-start inline-flex min-w-[100px] max-w-[160px] shrink-0">
            <input
              type="text"
              value={formData.moje || ''}
              placeholder="પેઢીનામું"
              className="input-name w-full -mb-0.5 text-left text-black pb-0.5 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none opacity-60"
            />
          </div>
          <span> મુકામે </span>
          <div className="inline-flex items-end gap-1 shrink-0 border-b border-black pb-0.5">
            <select
              value={familyTree[0]?.deathDateType || 'tarikh'}
              onChange={(e) => handleMainMemberChange('deathDateType', e.target.value)}
              className="appearance-none bg-transparent text-black text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
            >
              <option value="tarikh">તારીખ</option>
              <option value="aashre">આશરે</option>
            </select>
            <span className="text-gray-400 text-xs select-none">▾</span>
            <span className="text-gray-300 text-xs select-none">|</span>
            {(familyTree[0]?.deathDateType || 'tarikh') === 'tarikh' ? (
              <div className="inline-flex items-end min-w-[90px] max-w-[120px] declaration-date-wrap">
                <DatePicker
                  value={familyTree[0]?.death || ''}
                  onChange={(value) => handleMainMemberChange('death', value)}
                  variant="plain"
                  placeholder="તારીખ"
                  hideIcon
                />
              </div>
            ) : (
              <input
                type="text"
                value={familyTree[0]?.deathAashre || ''}
                onChange={(e) => handleMainMemberChange('deathAashre', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="આશરે"
                className="min-w-[80px] max-w-[120px] text-left text-black text-xs sm:text-sm bg-transparent border-0 focus:outline-none"
              />
            )}
          </div>
          <span> ના રોજ અવસાન થયેલું છે. </span>
          <div className="flex flex-col items-start inline-flex min-w-[80px] max-w-[160px] shrink-0">
            <input
              type="text"
              value={formData.pedhinamuPurpose}
              onChange={(e) => handleInputChange('pedhinamuPurpose', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="હેતુ"
              required
              className="hetu-input w-full -mb-0.5 text-left text-black pb-0.5 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none"
            />
          </div>
          <span> ના કામે તેમના પેઢીનામાની જરૂર હોઇ પેઢીનામું મેળવવા માટે, તારીખ </span>
          <div className="inline-flex items-end min-w-[100px] max-w-[130px] shrink-0 declaration-date-wrap">
            <DatePicker
              value={formData.applicationDate}
              onChange={(value) => handleInputChange('applicationDate', value)}
              variant="underline"
              placeholder="તારીખ"
            />
          </div>
          <span className="declaration-inline"> ના રોજ અરજી કરેલી છે. તે સંદર્ભે આજ રોજ લખાવું છૂ કે, ગુજરનારના વારસદારો જાહેર કરતું પેઢીનામું નીચે પ્રમાણે છે. જે હકીક્ત છે. </span>
          <div className="w-full border-b border-black mt-0.5 h-[20px] flex justify-center items-center">
          </div>
        </div>
      </div>

      {/* Location Fields - same gap and spacing for all */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        <div className="form-field flex flex-col gap-2">
          <RequiredLabel className="text-xs sm:text-sm font-medium text-black">મોજે</RequiredLabel>
          <CustomSelect
            value={formData.moje}
            onChange={(v) => handleInputChange('moje', v)}
            options={Object.keys(locationData).map((moje) => ({ value: moje, label: moje }))}
            placeholder="મોજે પસંદ કરો"
            className="form-select"
            required
          />
        </div>
        <div className="form-field flex flex-col gap-2">
          <RequiredLabel className="text-xs sm:text-sm font-medium text-black">તાલુકો</RequiredLabel>
          <input
            type="text"
            value={formData.taluko}
            onChange={(e) => handleInputChange('taluko', e.target.value)}
            onKeyDown={handleGujaratiInput}
            onPaste={handleGujaratiPaste}
            placeholder="તાલુકો"
            required
            readOnly={true}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white min-h-[2.75rem]"
          />
        </div>
        <div className="form-field flex flex-col gap-2">
          <RequiredLabel className="text-xs sm:text-sm font-medium text-black">જીલ્લો</RequiredLabel>
          <input
            type="text"
            value={formData.jillo}
            onChange={(e) => handleInputChange('jillo', e.target.value)}
            onKeyDown={handleGujaratiInput}
            onPaste={handleGujaratiPaste}
            placeholder="જીલ્લો"
            required
            readOnly={true}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white min-h-[2.75rem]"
          />
        </div>
      </div>

      {/* Family Tree */}
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-black">પેઢીનામું</h3>
      <FamilyTree members={familyTree} onChange={setFamilyTree} showBirthDeath={false} />

      {/* Applicant Declaration */}
      <div className="rounded-lg border border-gray-300 bg-white p-2 sm:p-3">

        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-xs sm:text-sm text-black declaration-flow leading-7">
          <span>ઉપર પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદાર તથા પંચોના લખાવ્યા મુજબનું બરાબર છે. અને જો આ પેઢીનામું ખોટું કરે તેમાં અમો અરજદાર તથા પંચો જવાબદાર છીએ. સદર પેઢીનામામાં અમો અરજદાર કે પંચોને કોઇ ખોટા વારસદારો આવેલા નથી કે સાચા વારસદારો બતાવવાના બાકી રાખેલા નથી. ખોટું પેઢીનામું લખાવવું ફોજદારી ગુન્હો છે. જેની અમોને સમજ છે. આ બાબતે તલાટીની લેશ માત્ર જવાબદાર નથી કે આ અંગે તેઓની કોઈ જવાબદારી નથી. </span>
          <p className="declaration-body w-full mt-1"> ઉપર મુજબનું પેઢીનામું, જવાબ મારી શુદ્ધ બુદ્ધિથી, અકકલ હોશિયારીથી, કોઇપણ જાતના દાબ-દબાણ, લોભ-લાલચ સિવાયનો લખાવ્યા મુજબનો સાચો અને ખરો છે. જે મે વાંચી, સમજી, સાંભળી વિચારીને સહી કરેલ છે. જે બરાબર છે.</p>
          <p className="declaration-body w-full"> ઉપર પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદારના રૂબરૂ જવાબ, તારીખ <div className="inline-flex items-end min-w-[100px] max-w-[130px] shrink-0 declaration-date-wrap">
            <DatePicker
              value={formData.pedhinamuDate}
              onChange={(value) => handleInputChange('pedhinamuDate', value)}
              variant="underline"
              placeholder="તારીખ"
            />
          </div>ના સોગંદનામા,રજુ કરેલ સાઘનિક તથા પંચોના લખાવ્યા મુજબનું તૈયાર કરી આપેલ છે. જેમાં તલાટીશ્રી જવાબદાર નથી.</p>

        </div>

        {/* Signature/Photo Area */}
        <div className="mt-3 sm:mt-4 text-black">
          <div className="flex flex-wrap justify-start gap-4 sm:gap-6">
            <div>
              <div className='flex items-center gap-2 text-black'>
                <p>સ્થળ:-</p>
                <div className="flex flex-col items-start">
                  <div className="font-medium -mb-1 text-left">{formData.moje}</div>
                  <div className="w-20 border-b border-black mt-1"></div>
                </div>
              </div>
              <div className='flex items-center gap-0 text-black mt-2'>
                <p>તારીખ:-</p>
                <div className="min-w-[120px] flex-1">
                  <DatePicker
                    value={formData.date}
                    onChange={(value) => handleInputChange('date', value)}
                    variant="underline"
                  />
                </div>
              </div>
              <div className='text-black'>રૂબરૂ</div>
            </div>

            {/* panch signatures section */}
            <div className='flex flex-wrap gap-4'>
              <p className="mb-2 block text-xs sm:text-sm font-medium text-black text-left">પંચો ની સહી</p>
              <div className="text-left">
                {formData.panchDetails.map((sig, index) => (
                  <div key={index} className={`${index === 0 ? 'mt-0' : 'mt-2'} text-left`}>
                    <p>{index + 1}.</p>
                    <div className="w-50 border-b border-black mt-1"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* lakhavanar signatures section */}
            <div className='flex flex-col flex-wrap gap-4 mt-28 items-start'>
              <div className="w-50 border-b border-black mt-1"></div>
              <p className="mb-2 block text-xs sm:text-sm font-medium text-black text-left">લખાવનારની સહી</p>
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
                  <div className="w-50 h-17.5 rounded-lg border border-black mt-1"></div>
                </div>
              </div>
              <div className='mt-3'>
                <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">
                  આધાર કાર્ડ નંબર :
                </RequiredLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  value={toGujaratiDigits(formData.applicantAadharNumber)}
                  onChange={(e) => handleInputChange('applicantAadharNumber', normalizeAadharInput(e.target.value))}
                  onKeyDown={handleAadharKeyDown}
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
        <div className="sm:mt-4 space-y-3 sm:space-y-4">
          {formData.panchDetails.map((panch, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-3 sm:pb-4 relative panch-detail-row"
            >
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="panch-field flex items-center gap-2 min-w-0 flex-1 basis-40 sm:basis-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-black shrink-0">{index + 1}.</h4>
                  <RequiredLabel className="shrink-0 text-xs font-medium text-black">નામ *</RequiredLabel>
                  <span className="text-black shrink-0">:-</span>
                  <input
                    type="text"
                    value={panch.name || ''}
                    onChange={(e) => handlePanchChange(index, 'name', e.target.value)}
                    placeholder="નામ"
                    className="input-name panch-input w-full min-w-0 min-h-[2.5rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
                <div className="panch-field flex items-center gap-2 min-w-0 flex-1 basis-32 sm:basis-0">
                  <RequiredLabel className="shrink-0 text-xs font-medium text-black">ઉ.આ.વ *</RequiredLabel>
                  <span className="text-black shrink-0">:-</span>
                  <input
                    type="text"
                    value={panch.age || ''}
                    onChange={(e) => handlePanchChange(index, 'age', e.target.value)}
                    placeholder="ઉ.આ.વ."
                    className="panch-input w-full min-w-0 min-h-[2.5rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
                <div className="panch-field flex items-center gap-2 min-w-0 flex-1 basis-40 sm:basis-0">
                  <RequiredLabel className="shrink-0 text-xs font-medium text-black">ધંધો *</RequiredLabel>
                  <span className="text-black shrink-0">:-</span>
                  <CustomSelect
                    value={panch.occupation || ''}
                    onChange={(v) => handlePanchChange(index, 'occupation', v)}
                    options={[
                      { value: 'કૃષિ', label: 'કૃષિ' },
                      { value: 'વેપાર', label: 'વેપાર' },
                      { value: 'નોકરી', label: 'નોકરી' },
                      { value: 'વ્યવસાય', label: 'વ્યવસાય' },
                      { value: 'અન્ય', label: 'અન્ય' },
                    ]}
                    placeholder="પસંદ કરો"
                    className="panch-input min-h-[2.5rem] py-2 text-sm"
                  />
                </div>
                <div className="panch-field flex items-center gap-2 min-w-0 flex-1 basis-40 sm:basis-0">
                  <RequiredLabel className="shrink-0 text-xs font-medium text-black">રહેવાસી *</RequiredLabel>
                  <span className="text-black shrink-0">:-</span>
                  <input
                    type="text"
                    value={formData.moje}
                    onChange={(e) => handlePanchChange(index, 'resident', e.target.value)}
                    onKeyDown={handleGujaratiInput}
                    onPaste={handleGujaratiPaste}
                    placeholder="રહેવાસી"
                    required
                    readOnly
                    className="panch-input w-full min-w-0 min-h-[2.5rem] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 space-y-4 text-sm text-black declaration-block">
          <div className="leading-7">
            <p className="text-sm leading-7 inline mr-2">
              અમો નીચે સહી કરનાર પંચો આજરોજ રૂબરૂ હાજર થઈ લખાવીએ છીએ કે, અમો અરજદાર તથા તેમના કુટુંબીજનોને વારસદારોને સારી રીતે ઓળખીએ છીએ, અરજદારનો જવાબ અમારી રૂબરૂ લેવામાં આવ્યો છે. જેમાં તેમણે પાન નં. ૧ ઉપર લખાવેલ પેઢીનામાની ખાતરી કરતાં તેમાં દર્શાવેલ કૂલ
            </p>
            <input
              type="text"
              value={toGujaratiDigits(formData.hayatCount)}
              onChange={(e) => handleInputChange('hayatCount', toEnglishDigits(e.target.value).replace(/\D/g, ''))}
              placeholder="હયાત"
              className="w-20 border-0 border-b border-gray-300 rounded-none bg-transparent px-1 py-0.5 text-sm focus:border-yellow-500 focus:outline-none text-black mr-2 mb-0 align-baseline"
            />
            <span className="mr-2">હયાત +</span>
            <input
              type="text"
              value={toGujaratiDigits(formData.maranCount)}
              onChange={(e) => handleInputChange('maranCount', toEnglishDigits(e.target.value).replace(/\D/g, ''))}
              placeholder="મરણ"
              className="w-20 border-0 border-b border-gray-300 rounded-none bg-transparent px-1 py-0.5 text-sm focus:border-yellow-500 focus:outline-none text-black mr-2 mb-0 align-baseline"
            />
            <span className="mr-2">મરણ = એમ કુલ</span>
            <input
              type="text"
              value={toGujaratiDigits(formData.totalHeirs)}
              onChange={(e) => handleInputChange('totalHeirs', toEnglishDigits(e.target.value).replace(/\D/g, ''))}
              placeholder="કુલ વારસદાર"
              className="w-25 border-0 border-b border-gray-300 rounded-none bg-transparent px-1 py-0.5 text-sm focus:border-yellow-500 focus:outline-none text-black mr-2 mb-0 align-baseline"
            />
            <span>વારસદાર છે. જેમાં કોઈ કાયદેસરના વારસદારો લખવાના રહી જતા નથી ખોટું પેઢીનામું લખાવવું ફોજદારી ગુનો છે જેની અમોને સમજ છે.</span>
          </div>
          <p className="text-sm leading-7">
            ઉપર મુજબ નું પંચનામું અમો પંચોના લખાવ્યા મુજબનું શુધ્ધ બુધ્ધિથી અકકલ હોશિયારીથી કોઈપણ જાતના દાબ-દબાણ લોભ-લાલચ સિવાયનું લખાવ્યા મુજબનું સાચું અને ખરું છે, જે અમોએ વાંચી સમજી સાંભળી વિચારીને નીચે સહી કરી આપેલ છે, એ બરાબર છે.
          </p>
          <p className="text-xs sm:text-sm leading-7">
            આ પેઢીનામું બનાવતી વખતે વારસદારોની ખાતરી કરવા અંગે જરૂરી સાધનિક પુરાવા રજુ થયેલ નથી. જેની આ પેઢીનામું નિણાયર્ક પુરાવા તરીકે ગણાશે નહી. અને જે કચેરીમાં રજુ થાય તે કચેરીના અધિકારીશ્રીઓએ આ પેઢીનામાની જરૂર જણાયે વારસદાર અંગે સાધનિક પુરાવાની ખાતરી કરવાની રહેશે. આ પેઢીનામામાં અરજદારે અથવા અમે પંચો કોઈ હકીકત છૂપાવ્યાનું જાહેર થશે તો આ પેઢીનામું આપોઆપ રદ થયેલ ગણાશે. ખોટી હકીકત લખાવવી, અને સાચી હકીકત છૂપાવવી તે ફોજદારી ગુન્હો બને છે જેની અમોને જાણ છે. જે અમોને વાંચી, વંચાવી, સાંભળી અને વિચારીને સહી કરેલ છે. જે અમોને કબુલ મંજુર છે.
          </p>
        </div>

        {/* Witness Photo and Signature Sections */}
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4">
          {formData.panchDetails.map((panch, index) => (
            <div key={`panch_details_${index}`} className="border-b border-gray-200 pb-3 sm:pb-4 flex items-center gap-3 relative flex-1 min-w-64">
              {formData.panchDetails.length > 3 && (
                <button
                  onClick={() => deletePanch(index)}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors z-10"
                  aria-label="Delete panch"
                  title="Delete panch"
                >
                  <DeleteIcon height="16" width="16" color="red" />
                </button>
              )}
              <div className="w-24 sm:w-28">
                <PhotoUpload
                  value={panch.photo || ''}
                  onChange={(value) => handlePanchPhotoChange(index, value)}
                  label="પંચનો ફોટો"
                />
              </div>
              <div className='flex flex-col gap-2 flex-1'>
                <p className="mb-1 block text-xs sm:text-sm text-black whitespace-nowrap">
                  અંગુઠાનું નિશાન
                </p>
                <div className="w-28 h-12 rounded-lg border border-black mt-1"></div>
                <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm text-black whitespace-nowrap">{index < 3} પંચ-{index + 1}</h4>
                <div className="w-28 border-b border-black mt-1"></div>
                <RequiredLabel className={`mb-1 block text-xs sm:text-sm whitespace-nowrap ${index < 3 ? 'text-black' : 'text-gray-500'}`}>
                  આધારકાર્ડ નં:
                </RequiredLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  value={toGujaratiDigits(panch.aadhar)}
                  onChange={(e) => handlePanchChange(index, 'aadhar', normalizeAadharInput(e.target.value))}
                  onKeyDown={handleAadharKeyDown}
                  placeholder="આધારકાર્ડ નં."
                  required={index < 3}
                  className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
            </div>
          ))}
          {formData.panchDetails.length < 5 &&
            <button
              onClick={addPanch}
              className="flex items-center justify-center text-black text-4xl flex-shrink-0"
            >
              <span>+</span>
            </button>
          }
        </div>

        {/* 
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
          <div className='flex items-center gap-2 text-black'>
            <p>સ્થળ:-</p>
            <div className="flex flex-col">
              <div className="font-medium mx-auto -mb-1">{formData.moje}</div>
              <div className="w-25 border-b border-black mt-1"></div>
            </div>
          </div>
          <div>
            <DatePicker
              value={formData.finalDate}
              onChange={(value) => handleInputChange('finalDate', value)}
              label="તારીખ"
              variant="underline"
            />
          </div>
        </div> */}
      </div>

      {/* Final Section */}
      <div className="rounded-lg border border-gray-300 bg-white p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-black">
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-2">
            {/* <div>
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
            </div> */}
            <div className='flex items-center gap-2 text-black'>
              <p>સ્થળ:-</p>
              <div className="flex flex-col items-start">
                <div className="font-medium -mb-1 text-left">{formData.moje}</div>
                <div className="w-25 border-b border-black mt-1"></div>
              </div>
            </div>
            {/* <div>
              <DatePicker
                value={formData.finalDate}
                onChange={(value) => handleInputChange('finalDate', value)}
                label="તારીખ:-"
                variant="underline"
              />
            </div> */}
            <div className='flex items-center gap-2 text-black mt-3'>
              <p>તારીખ:-</p>
              <div className="w-37.5 h-12.5">
                <DatePicker
                  value={formData.finalDate}
                  onChange={(value) => handleInputChange('finalDate', value)}
                  variant="underline"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-baseline gap-1 text-xs sm:text-sm text-black leading-7">
            <span>આ પ્રમાણેનું પેઢીનામું અમો આ કામના અરજદારના રૂબરૂ જવાબ, તથા તારીખ</span>
            <div className="inline-flex flex-col min-w-0 shrink-0" style={{ minHeight: 28 }}>
              <DatePicker
                value={formData.applicationDate}
                onChange={(value) => handleInputChange('applicationDate', value)}
                variant="underline"
              />
            </div>
            <span>ના રોજ નોટરી શ્રી</span>
            <div className="flex flex-col items-start inline-flex min-w-[120px] sm:min-w-[160px] max-w-[180px] sm:max-w-[220px] shrink-0">
              <input
                type="text"
                value={formData.notaryName}
                onChange={(e) => handleInputChange('notaryName', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="નોટરી નામ"
                required
                className="w-full -mb-2 text-left text-black pb-1 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none"
              />
            </div>
            <span>રજી નં.</span>
            <div className="flex flex-col items-start inline-flex min-w-[80px] max-w-[100px] shrink-0">
              <input
                type="text"
                value={toGujaratiDigits(formData.regNo)}
                onChange={(e) => handleInputChange('regNo', toEnglishDigits(e.target.value))}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="રજી નં."
                required
                className="w-full -mb-2 text-left text-black pb-1 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none"
              />
            </div>
            <span>ના સિ.નં.</span>
            <div className="flex flex-col items-start inline-flex min-w-[80px] max-w-[100px] shrink-0">
              <input
                type="text"
                value={toGujaratiDigits(formData.serialNo)}
                onChange={(e) => handleInputChange('serialNo', toEnglishDigits(e.target.value))}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="ના સિ.નં."
                required
                className="w-full -mb-2 text-left text-black pb-1 text-xs sm:text-sm bg-transparent border-0 border-b border-black rounded-none"
              />
            </div>
            <span>તારીખ</span>
            <div className="inline-flex flex-col min-w-0 shrink-0" style={{ minHeight: 28 }}>
              <DatePicker
                value={formData.notaryDate}
                onChange={(value) => handleInputChange('notaryDate', value)}
                variant="underline"
              />
            </div>
            <span>થી કરેલ સોગંદનામું/સ્વઘોષણા તથા પંચોના લખાવ્યા મુજબ તૈયાર કરેલ છે. વારસદારોની ખોટા ખરા અંગે સબંધિત તલાટી કમ મંત્રીશ્રી જવાબદાર નથી.</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-1 text-xs sm:text-sm text-black leading-7">
            <span>આ પેઢીનામું</span>
            <span className="hetu-label whitespace-nowrap">હેતુ</span>
            <input
              type="text"
              value={formData.pedhinamuPurpose}
              onChange={(e) => handleInputChange('pedhinamuPurpose', e.target.value)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              placeholder="હેતુ"
              required
              className="hetu-input border-0 border-b border-gray-300 rounded-none bg-transparent px-1 py-0.5 min-w-[80px] flex-1 lg:max-w-[200px] focus:border-yellow-500 focus:outline-none text-black"
            />
            <span>ના કામે ઉપયોગ કરી શકાશે.</span>
          </div>
          <p className="text-xs sm:text-sm leading-7">
            સદર પેઢીનામું વારસાઇ પ્રમાણપત્ર કે પ્રોબ્રેટ નથી પેઢીનામાંમા માત્ર રૂબરૂ જવાબ પંચોનું પંચનામું સામેલ છે વારસદારો અંગે સાંધનિક પુરાવાની ખાત્રી અલગથી કરવાની રહેશે, આ પેઢીનામાંમા દર્શાવેલા વારસદારો અંગે કોઈ વિવાદ થશે તો કોર્ટનું વારસાઈ સર્ટીફીકેટ આખરી ગણાશે.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-2 sm:mt-3 pb-4 sm:pb-0 applicant-signature-section">
            <div className="w-full sm:w-auto min-w-0 sm:min-w-50">અરજદાર ની સહિ.
              {/* <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black pt-4">
                
              </RequiredLabel> */}
              {/* <input
                type="text"
                value={formData.applicantSignature}
                onChange={(e) => handleInputChange('applicantSignature', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="અરજદાર ની સહિ"
                required
                className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
              /> */}
              <div className="flex flex-col items-start w-full min-w-0 sm:min-w-50 max-w-full sm:max-w-75 pt-3 sm:pt-4">
                <input
                  type="text"
                  value={formData.applicantSignature}
                  onChange={(e) => handleInputChange('applicantSignature', e.target.value)}
                  onKeyDown={handleGujaratiInput}
                  onPaste={handleGujaratiPaste}
                  placeholder="અરજદાર ની સહિ"
                  required
                  className="w-full -mb-2 text-left text-black pb-1 text-xs sm:text-sm"
                />
                <div className="w-full border-b border-black mt-1"></div>
              </div>
            </div>
            <div className="w-full sm:w-auto min-w-0 sm:min-w-50">રૂબરૂ
              {/* <RequiredLabel className="mb-1 block text-xs sm:text-sm font-medium text-black">રૂબરૂ</RequiredLabel> */}
              {/* <input
                type="text"
                value={formData.inPerson}
                onChange={(e) => handleInputChange('inPerson', e.target.value)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                placeholder="રૂબરૂ"
                required
                className="w-full rounded-lg border border-gray-300 px-2 sm:px-3 py-2 text-sm sm:text-base focus:border-yellow-500 focus:outline-none text-black bg-white"
              /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Print Controls */}
      <div className="flex flex-wrap items-center gap-4 pb-4 sm:pb-8">
        <button
          onClick={handleDownloadTemplatePDF}
          disabled={isGeneratingPDF}
          className={`flex items-center gap-2 rounded-lg px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white transition-all ${isGeneratingPDF
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>PDF બનાવી રહ્યા છીએ...</span>
            </>
          ) : (
            <span>Download PDF</span>
          )}
        </button>
      </div>
    </div>
  );
}

