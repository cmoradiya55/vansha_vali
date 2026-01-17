'use client';

import React from 'react';
import DatePicker from './DatePicker';
import { toast } from 'react-toastify';
import { handleGujaratiInput, handleGujaratiPaste, filterGujaratiOnly } from '@/utils/gujaratiInputValidator';

const AddIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
  deathDateType?: string; // 'tarikh' or 'aashre'
  deathAashre?: string; // approximate date text
  children: FamilyMember[];
}

interface HierarchicalTreeProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

const MAX_CHILDREN_PER_PARENT = 10; // Max 10 children per parent
const MAX_GENERATIONS = 4; // Max 4 generations

export default function HierarchicalTree({ members, onChange }: HierarchicalTreeProps) {
  // Initialize with default parent if empty
  React.useEffect(() => {
    if (members.length === 0) {
      const defaultMember: FamilyMember = {
        id: Date.now().toString(),
        relation: '',
        hayat: 'મરણ',
        death: '',
        deathDateType: 'tarikh',
        deathAashre: '',
        name: '',
        children: [],
      };
      onChange([defaultMember]);
    }
  }, []);

  // Get parent's generation level
  const getParentGenerationLevel = (parentId: string | null, members: FamilyMember[], level: number = 0): number => {
    if (parentId === null) return -1; // Root level
    
    for (const m of members) {
      if (m.id === parentId) return level;
      const found = getParentGenerationLevel(parentId, m.children, level + 1);
      if (found !== -1) return found;
    }
    return -1;
  };

  const addChild = (parentId: string) => {
    // Check generational depth limit
    const parentLevel = getParentGenerationLevel(parentId, members);
    const newMemberLevel = parentLevel + 1;
    
    // Check children limit per parent
    let parent: FamilyMember | null = null;
    
    if (parentId === null) {
      // Root level - check total root members
      if (members.length >= MAX_CHILDREN_PER_PARENT) {
        toast.warning(`You can not add more children! મહત્તમ ${MAX_CHILDREN_PER_PARENT} સંતાનો ઉમેરી શકાય છે.`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    } else {
      // Find parent for non-root members
      const findParent = (ms: FamilyMember[]): FamilyMember | null => {
        for (const m of ms) {
          if (m.id === parentId) return m;
          const found = findParent(m.children);
          if (found) return found;
        }
        return null;
      };
      
      parent = findParent(members);
      
      if (parent && parent.children.length >= MAX_CHILDREN_PER_PARENT) {
        // Determine the correct message based on the new member's level
        let levelText = '';
        let gujaratiText = '';
        
        if (newMemberLevel === 1) {
          levelText = 'children';
          gujaratiText = 'સંતાનો';
        } else if (newMemberLevel === 2) {
          levelText = 'grand children';
          gujaratiText = 'પૌત્રો';
        } else {
          levelText = 'great-grandchildren';
          gujaratiText = 'પ્રપૌત્રો';
        }
        
        toast.warning(`You can not add more ${levelText}! મહત્તમ ${MAX_CHILDREN_PER_PARENT} ${gujaratiText} ઉમેરી શકાય છે.`, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }
    
    // Check generational depth limit (after checking children limit)
    if (newMemberLevel >= MAX_GENERATIONS) {
      toast.warning(`You can not add more grand children! મહત્તમ ${MAX_GENERATIONS} પેઢી સુધી ઉમેરી શકાય છે.`, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const newChild: FamilyMember = {
      id: Date.now().toString() + Math.random(),
      relation: '',
      hayat: 'મરણ',
      death: '',
      deathDateType: 'tarikh',
      deathAashre: '',
      name: '',
      children: [],
    };

    const updateMembers = (ms: FamilyMember[]): FamilyMember[] => {
      return ms.map((m) => {
        if (m.id === parentId) {
          return { ...m, children: [...m.children, newChild] };
        }
        return { ...m, children: updateMembers(m.children) };
      });
    };
    onChange(updateMembers(members));
  };

  const removeMember = (id: string, parentId: string | null) => {
    if (parentId === null) {
      // Remove root member
      onChange(members.filter((m) => m.id !== id));
    } else {
      const updateMembers = (ms: FamilyMember[]): FamilyMember[] => {
        return ms.map((m) => {
          if (m.id === parentId) {
            return { ...m, children: m.children.filter((c) => c.id !== id) };
          }
          return { ...m, children: updateMembers(m.children) };
        });
      };
      onChange(updateMembers(members));
    }
  };

  const updateMember = (id: string, field: string, value: string, parentId: string | null) => {
    // Filter out non-Gujarati characters for text fields
    const textFields = ['name', 'relation', 'age', 'deathAashre'];
    let filteredValue = value;
    if (textFields.includes(field)) {
      filteredValue = filterGujaratiOnly(value);
    }
    
    if (parentId === null) {
      // Update root member
      onChange(
        members.map((m) => (m.id === id ? { ...m, [field]: filteredValue } : m))
      );
    } else {
      const updateMembers = (ms: FamilyMember[]): FamilyMember[] => {
        return ms.map((m) => {
          if (m.id === parentId) {
            return {
              ...m,
              children: m.children.map((c) => (c.id === id ? { ...c, [field]: filteredValue } : c)),
            };
          }
          return { ...m, children: updateMembers(m.children) };
        });
      };
      onChange(updateMembers(members));
    }
  };

  const renderMember = (member: FamilyMember, isRoot: boolean = false, parentId: string | null = null, level: number = 0, parentName: string = '') => {
    const status = member.hayat || 'મરણ';
    const isHayat = status === 'હયાત';
    const deathDateType = member.deathDateType || 'tarikh';
    
    // Generation labels in Gujarati
    const generationLabels = ['મુખ્ય', 'સંતાન', 'પૌત્ર', 'પ્રપૌત્ર'];
    const generationLabel = generationLabels[level] || `પેઢી ${level + 1}`;
    
    const canAddChildren = level < MAX_GENERATIONS - 1;
    const childrenCount = member.children.length;
    const canAddMoreChildren = childrenCount < MAX_CHILDREN_PER_PARENT;
    
    return (
      <div key={member.id} className="flex flex-col items-center">
        {/* Generation Label */}
        {!isRoot && (
          <div className="mb-1 text-[9px] sm:text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1 sm:px-1.5 py-0.5">
            {generationLabel} {parentName ? `(${parentName} ના)` : ''}
          </div>
        )}
        
        <div 
          className={`relative mb-1 border-2 bg-white p-1 sm:p-1.5 shadow-sm min-w-[160px] sm:min-w-[200px] max-w-[300px] sm:max-w-[350px]
            ${
            isRoot 
              ? 'border-yellow-500' 
              : 'border-gray-400'
          }`}
        >
          {/* Generation Badge for Root */}
          {/* {isRoot && (
            <div className="absolute -top-1.5 left-2 bg-yellow-500 text-white text-[8px] sm:text-[9px] font-semibold px-1 py-0.5">
              {generationLabel}
            </div>
          )} */}
          
          {/* First Row */}
          <div className={`mb-1 flex gap-0.5 sm:gap-1 ${isHayat ? '' : ''}`}>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="સબંધ"
                value={member.relation || ''}
                onChange={(e) => updateMember(member.id, 'relation', e.target.value, parentId)}
                onKeyDown={handleGujaratiInput}
                onPaste={handleGujaratiPaste}
                required
                className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
              />
            </div>
            <div className="flex-1 min-w-0">
              <select
                value={status}
                onChange={(e) => updateMember(member.id, 'hayat', e.target.value, parentId)}
                className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
              >
                <option value="મરણ">મરણ</option>
                <option value="હયાત">હયાત</option>
              </select>
            </div>
            {!isHayat && (
              <div className="flex-1 min-w-0">
                <select
                  value={deathDateType}
                  onChange={(e) => updateMember(member.id, 'deathDateType', e.target.value, parentId)}
                  className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                >
                  <option value="tarikh">તારીખ</option>
                  <option value="aashre">આશરે</option>
                </select>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isHayat ? (
                <input
                  type="text"
                  placeholder="ઉંમર"
                  value={member.age || ''}
                  onChange={(e) => updateMember(member.id, 'age', e.target.value, parentId)}
                  onKeyDown={handleGujaratiInput}
                  onPaste={handleGujaratiPaste}
                  required
                  className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              ) : (
                <div className="relative">
                  {deathDateType === 'tarikh' ? (
                    <DatePicker
                      value={member.death || ''}
                      onChange={(value) => updateMember(member.id, 'death', value, parentId)}
                      className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                      size="small"
                      placeholder="તારીખ"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="આશરે"
                      value={member.deathAashre || ''}
                      onChange={(e) => updateMember(member.id, 'deathAashre', e.target.value, parentId)}
                      onKeyDown={handleGujaratiInput}
                      onPaste={handleGujaratiPaste}
                      required
                      className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="w-full">
            <input
              type="text"
              placeholder="નામ"
              value={member.name || ''}
              onChange={(e) => updateMember(member.id, 'name', e.target.value, parentId)}
              onKeyDown={handleGujaratiInput}
              onPaste={handleGujaratiPaste}
              required
              className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[9px] sm:text-[10px] focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
          </div>
        </div>

        {/* Add and Delete Icons - Same Line, Outside Card */}
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {canAddChildren && canAddMoreChildren && (
            <button
              onClick={() => addChild(member.id)}
              className="flex items-center gap-0.5  px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-white transition-colors cursor-pointer"
              title={`Add ${level === 0 ? 'Child' : level === 1 ? 'Grandchild' : 'Great-grandchild'}`}
            >
              <AddIcon className="h-3 w-3 sm:h-4 sm:w-4 text-black"/>
              {/* <span className="text-[9px] sm:text-[10px]">+</span> */}
            </button>
          )}
          {/* Hide delete button for root members (mukhya pedhi) */}
          {!isRoot && (
            <button
              onClick={() => removeMember(member.id, parentId)}
              className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center text-red-700 transition-colors cursor-pointer"
              title="Delete"
            >
              <DeleteIcon className="h-3 w-3 sm:h-4 sm:w-4"/>
            </button>
          )}
        </div>

        {/* Children */}
        {member.children.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-col items-center w-full relative">
            {/* Vertical Line from Parent to Children */}
            <div className="relative flex items-center justify-center w-full mb-2">
              <div className="h-8 sm:h-10 w-1 sm:w-1.5 bg-gradient-to-b from-yellow-500 to-yellow-400 rounded-full shadow-sm"></div>
              {/* Down Arrow */}
              <div className="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 z-10">
                <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 18L6 12H9V6H15V12H18L12 18Z" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                </svg>
              </div>
            </div>
            
            {/* Horizontal Line connecting all children (only if more than 1 child) */}
            {member.children.length > 1 && (
              <div className="relative w-full mb-2 flex justify-center">
                <div 
                  className="h-1 sm:h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full shadow-sm relative"
                  style={{
                    width: `${Math.max(75, Math.min(95, (member.children.length - 1) * 18))}%`,
                    minWidth: `${(member.children.length - 1) * 160}px`
                  }}
                >
                  {/* Vertical connector from parent line */}
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 h-3 sm:h-4 w-1 sm:w-1.5 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Children Container with proper connections */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full overflow-x-auto pb-2 relative">
              {member.children.map((child, index) => (
                <div key={child.id} className="flex flex-col items-center relative">
                  {/* Vertical line from horizontal connector to each child (only if multiple children) */}
                  {member.children.length > 1 && (
                    <>
                      <div className="absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2 h-4 sm:h-5 w-1 sm:w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
                      {/* Arrow pointing to child */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                        <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 18L6 12H9V6H15V12H18L12 18Z" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                        </svg>
                      </div>
                    </>
                  )}
                  {renderMember(child, false, member.id, level + 1, member.name )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-2 sm:p-4">
      {/* Limits Display */}
      {/* <div className="mb-3 sm:mb-4 rounded-lg bg-yellow-50 px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs sm:text-sm font-medium text-black">
              મહત્તમ પેઢી: <span className="font-bold text-yellow-600">{MAX_GENERATIONS}</span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-black">
              પ્રતિ સભ્ય મહત્તમ સંતાનો: <span className="font-bold text-yellow-600">{MAX_CHILDREN_PER_PARENT}</span>
            </span>
          </div>
          <div className="text-xs text-black">
            મરણ: 4 પેઢી સુધી
          </div>
        </div>
      </div> */}
      
      {/* Scrollable Container - Horizontal scroll only */}
      <div className="w-full overflow-x-auto overflow-y-visible border-2 border-gray-200 rounded-lg p-2 sm:p-4 bg-gray-50">
        <div className="flex flex-col items-center min-w-max">
          <div className="flex flex-wrap justify-center gap-6 w-full">
            {members.map((member) => renderMember(member, true, null, 0))}
          </div>
          {/* Root level children limit display */}
          {members.length > 0 && members.length >= MAX_CHILDREN_PER_PARENT && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  toast.warning(`You can not add more children! મહત્તમ ${MAX_CHILDREN_PER_PARENT} સંતાનો ઉમેરી શકાય છે.`, {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                }}
                className="cursor-pointer"
              >
                <p className="text-xs text-red-600 font-semibold hover:text-red-700">You can not add more children</p>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll Hint */}
      {/* {members.length > 0 && (
        <div className="mt-2 text-center text-[10px] sm:text-xs text-gray-500">
          💡 પરિવારનું વંશવેલો જોવા માટે સ્ક્રોલ કરો (Scroll to view family tree)
        </div>
      )} */}
    </div>
  );
}

