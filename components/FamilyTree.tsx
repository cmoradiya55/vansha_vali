'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

// Simple SVG Icon Components for website
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

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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
  hayat?: string; // હયાત (Alive/Existing) field
  birth?: string;
  death?: string;
  children: FamilyMember[];
}

interface FamilyTreeProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
  showBirthDeath?: boolean;
  maxChildrenPerParent?: number; // Max children per parent
  maxGenerations?: number; // Max generational depth
}

const MAX_CHILDREN_PER_PARENT = 10; // Default: max 10 children per parent
const MAX_GENERATIONS_HAYATI = 3; // Hayati: 3 generations (root → children → grandchildren)
const MAX_GENERATIONS_MARAN = 4; // Maran: 4 generations (root → children → grandchildren → great-grandchildren)

export default function FamilyTree({ 
  members, 
  onChange, 
  showBirthDeath = false, 
  maxChildrenPerParent = MAX_CHILDREN_PER_PARENT,
  maxGenerations = showBirthDeath ? MAX_GENERATIONS_MARAN : MAX_GENERATIONS_HAYATI
}: FamilyTreeProps) {
  
  // Initialize with default root member if empty
  React.useEffect(() => {
    if (members.length === 0) {
      const defaultMember: FamilyMember = {
        id: Date.now().toString(),
        name: '',
        age: '',
        relation: '',
        hayat: '',
        birth: '',
        death: '',
        children: [],
      };
      onChange([defaultMember]);
    }
  }, []); // Only run once on mount
  
  // Get current generation level of a member
  const getGenerationLevel = (member: FamilyMember, members: FamilyMember[], level: number = 0): number => {
    for (const m of members) {
      if (m.id === member.id) return level;
      const found = getGenerationLevel(member, m.children, level + 1);
      if (found !== -1) return found;
    }
    return -1;
  };

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

  const addMember = (parentId: string | null) => {
    // Check generational depth limit
    const parentLevel = getParentGenerationLevel(parentId, members);
    const newMemberLevel = parentLevel + 1;
    
    // Check children limit per parent (for both root and non-root)
    let parent: FamilyMember | null = null;
    
    if (parentId === null) {
      // Root level - check total root members
      if (members.length >= maxChildrenPerParent) {
        toast.warning(`You can not add more children! મહત્તમ ${maxChildrenPerParent} સંતાનો ઉમેરી શકાય છે.`, {
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
      
      if (parent && parent.children.length >= maxChildrenPerParent) {
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
        
        toast.warning(`You can not add more ${levelText}! મહત્તમ ${maxChildrenPerParent} ${gujaratiText} ઉમેરી શકાય છે.`, {
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
    if (newMemberLevel >= maxGenerations) {
      toast.warning(`You can not add more grand children! મહત્તમ ${maxGenerations} પેઢી સુધી ઉમેરી શકાય છે.`, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: '',
      age: '',
      relation: '',
      hayat: '',
      birth: '',
      death: '',
      children: [],
    };

    if (parentId === null) {
      onChange([...members, newMember]);
    } else {
      const updateMembers = (ms: FamilyMember[]): FamilyMember[] => {
        return ms.map((m) => {
          if (m.id === parentId) {
            return { ...m, children: [...m.children, newMember] };
          }
          return { ...m, children: updateMembers(m.children) };
        });
      };
      onChange(updateMembers(members));
    }
  };

  const removeMember = (id: string) => {
    const removeFromTree = (ms: FamilyMember[]): FamilyMember[] => {
      return ms.filter((m) => m.id !== id).map((m) => ({
        ...m,
        children: removeFromTree(m.children),
      }));
    };
    onChange(removeFromTree(members));
  };

  const updateMember = (id: string, field: string, value: string) => {
    const updateInTree = (ms: FamilyMember[]): FamilyMember[] => {
      return ms.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        return { ...m, children: updateInTree(m.children) };
      });
    };
    onChange(updateInTree(members));
  };

  const renderMember = (member: FamilyMember, level: number = 0, parentName: string = '') => {
    const isRoot = level === 0;
    const canAddChildren = level < maxGenerations - 1;
    const childrenCount = member.children.length;
    const canAddMoreChildren = childrenCount < maxChildrenPerParent;
    
    // Generation labels in Gujarati
    const generationLabels = ['મુખ્ય', 'સંતાન', 'પૌત્ર', 'પ્રપૌત્ર'];
    const generationLabel = generationLabels[level] || `પેઢી ${level + 1}`;
    
    return (
      <div key={member.id} className="flex flex-col items-center">
        {/* Generation Label */}
        {!isRoot && (
          <div className="mb-1 text-[9px] sm:text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1 sm:px-1.5 py-0.5">
            {generationLabel} {parentName ? `(${parentName} ના)` : ''}
          </div>
        )}
        
        <div 
        className={`relative mb-1 border-2 bg-white p-1 sm:p-1.5 shadow-sm min-w-[160px] sm:min-w-[200px] max-w-[180px] sm:max-w-[220px]
          ${
          isRoot 
            ? 'border-yellow-500' 
            : 'border-gray-400'
        }`}
        >
          {/* Generation Badge for Root */}
          {isRoot && (
            <div className="absolute -top-1.5 left-2 bg-yellow-500 text-white text-[8px] sm:text-[9px] font-semibold px-1 py-0.5">
              {generationLabel}
            </div>
          )}
          
          {/* First Row: સબંધ (dropdown), હયાત (dropdown), ઉંમર (text) - for hayati */}
          {!showBirthDeath ? (
            <div className="mb-1 flex gap-0.5 sm:gap-1">
              <div className="flex-1 min-w-0">
                <select
                  value={member.relation || ''}
                  onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                  className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                >
                  <option value="">સબંધ</option>
                  <option value="પિતા">પિતા</option>
                  <option value="માતા">માતા</option>
                  <option value="પુત્ર">પુત્ર</option>
                  <option value="પુત્રી">પુત્રી</option>
                  <option value="પત્ની">પત્ની</option>
                  <option value="પતિ">પતિ</option>
                  <option value="ભાઈ">ભાઈ</option>
                  <option value="બહેન">બહેન</option>
                  <option value="પિતામહ">પિતામહ</option>
                  <option value="માતામહ">માતામહ</option>
                  <option value="પૌત્ર">પૌત્ર</option>
                  <option value="પૌત્રી">પૌત્રી</option>
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <select
                  value={member.hayat || ''}
                  onChange={(e) => updateMember(member.id, 'hayat', e.target.value)}
                  className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                >
                  <option value="">હયાત</option>
                  <option value="હયાત">હયાત</option>
                  <option value="મરણ">મરણ</option>
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="ઉંમર"
                  value={member.age || ''}
                  onChange={(e) => updateMember(member.id, 'age', e.target.value)}
                  className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="mb-1 flex gap-0.5">             
              <div className="flex-1 min-w-0 max-w-[30%]">
                <input
                  type="text"
                  placeholder="સબંધ"
                  value={member.relation || ''}
                  onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                  className="w-full border border-gray-300 px-0.5 py-0.5 text-[7px] sm:text-[8px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>             
              <div className="flex-1 min-w-0 max-w-[35%]">
                <input
                  type="text"
                  placeholder="જન્મ"
                  value={member.birth || ''}
                  onChange={(e) => updateMember(member.id, 'birth', e.target.value)}
                  className="w-full border border-gray-300 px-0.5 py-0.5 text-[7px] sm:text-[8px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>            
              <div className="flex-1 min-w-0 max-w-[35%]">
                <input
                  type="text"
                  placeholder="મરણ"
                  value={member.death || ''}
                  onChange={(e) => updateMember(member.id, 'death', e.target.value)}
                  className="w-full border border-gray-300 px-0.5 py-0.5 text-[7px] sm:text-[8px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                />
              </div>
            </div>
          )}

          {/* Second Row: નામ (Name) */}
          <div className="w-full">
            <input
              type="text"
              placeholder="નામ"
              value={member.name || ''}
              onChange={(e) => updateMember(member.id, 'name', e.target.value)}
              className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[9px] sm:text-[10px] focus:border-yellow-500 focus:outline-none text-black bg-white"
            />
          </div>

        </div>
        
        {/* Add and Delete Icons - Same Line, Outside Card */}
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {canAddChildren && canAddMoreChildren && (
            <button
              onClick={() => addMember(member.id)}
              className="flex items-center gap-0.5 bg-yellow-500 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-white transition-colors hover:bg-yellow-600"
              title={`Add ${level === 0 ? 'Child' : level === 1 ? 'Grandchild' : 'Great-grandchild'}`}
            >
              <AddIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
              <span className="text-[9px] sm:text-[10px]">+</span>
            </button>
          )}
          {/* Hide delete button for root members (mukhya pedhi) */}
          {!isRoot && (
            <button
              onClick={() => removeMember(member.id)}
              className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Delete"
            >
              <DeleteIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
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
                <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
                // className="text-yellow-600 drop-shadow-sm"
                >
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
                        <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
                        // className="text-yellow-600 drop-shadow-sm"
                        >
                          <path d="M12 18L6 12H9V6H15V12H18L12 18Z" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                        </svg>
                      </div>
                    </>
                  )}
                  {renderMember(child, level + 1, member.name || 'અજ્ઞાત')}
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
      <div className="mb-3 sm:mb-4 rounded-lg bg-yellow-50 px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs sm:text-sm font-medium text-black">
              મહત્તમ પેઢી: <span className="font-bold text-yellow-600">{maxGenerations}</span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-black">
              પ્રતિ સભ્ય મહત્તમ સંતાનો: <span className="font-bold text-yellow-600">{maxChildrenPerParent}</span>
            </span>
          </div>
          <div className="text-xs text-black">
            {showBirthDeath ? 'મરણ: 4 પેઢી સુધી' : 'હયાતી: 3 પેઢી સુધી'}
          </div>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="w-full overflow-auto max-h-[60vh] sm:max-h-[70vh] border-2 border-gray-200 rounded-lg p-2 sm:p-4 bg-gray-50">
        <div className="flex flex-col items-center min-w-max">
          <div className="flex flex-wrap justify-center gap-6 w-full">
            {members.map((member) => renderMember(member, 0))}
          </div>
          {/* Root level children limit display */}
          {members.length > 0 && members.length >= maxChildrenPerParent && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  toast.warning(`You can not add more children! મહત્તમ ${maxChildrenPerParent} સંતાનો ઉમેરી શકાય છે.`, {
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
      {members.length > 0 && (
        <div className="mt-2 text-center text-[10px] sm:text-xs text-gray-500">
          💡 પરિવારનું વંશવેલો જોવા માટે સ્ક્રોલ કરો (Scroll to view family tree)
        </div>
      )}
    </div>
  );
}




// 'use client';

// import React, { useState } from 'react';
// import { toast } from 'react-toastify';

// // Simple SVG Icon Components
// const AddIcon = ({ className }: { className?: string }) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={1.5}
//     stroke="currentColor"
//     className={className}
//   >
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//   </svg>
// );

// const DeleteIcon = ({ className }: { className?: string }) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//     strokeWidth={1.5}
//     stroke="currentColor"
//     className={className}
//   >
//     <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
//   </svg>
// );

// interface FamilyMember {
//   id: string;
//   name: string;
//   age?: string;
//   relation?: string;
//   hayat?: string;
//   birth?: string;
//   death?: string;
//   children: FamilyMember[];
// }

// interface FamilyTreeProps {
//   members: FamilyMember[];
//   onChange: (members: FamilyMember[]) => void;
//   showBirthDeath?: boolean;
//   maxChildrenPerParent?: number;
//   maxGenerations?: number;
//   containerHeight?: string; // Optional custom height
// }

// const MAX_CHILDREN_PER_PARENT = 10;
// const MAX_GENERATIONS_HAYATI = 3;
// const MAX_GENERATIONS_MARAN = 4;

// export default function FamilyTree({ 
//   members, 
//   onChange, 
//   showBirthDeath = false, 
//   maxChildrenPerParent = MAX_CHILDREN_PER_PARENT,
//   maxGenerations = showBirthDeath ? MAX_GENERATIONS_MARAN : MAX_GENERATIONS_HAYATI,
//   containerHeight = '600px' // Default height
// }: FamilyTreeProps) {
  
//   // Initialize with default root member if empty
//   React.useEffect(() => {
//     if (members.length === 0) {
//       const defaultMember: FamilyMember = {
//         id: Date.now().toString(),
//         name: '',
//         age: '',
//         relation: '',
//         hayat: '',
//         birth: '',
//         death: '',
//         children: [],
//       };
//       onChange([defaultMember]);
//     }
//   }, []);

//   // Get parent's generation level
//   const getParentGenerationLevel = (parentId: string | null, members: FamilyMember[], level: number = 0): number => {
//     if (parentId === null) return -1;
    
//     for (const m of members) {
//       if (m.id === parentId) return level;
//       const found = getParentGenerationLevel(parentId, m.children, level + 1);
//       if (found !== -1) return found;
//     }
//     return -1;
//   };

//   const addMember = (parentId: string | null) => {
//     const parentLevel = getParentGenerationLevel(parentId, members);
//     const newMemberLevel = parentLevel + 1;
    
//     if (parentId === null) {
//       if (members.length >= maxChildrenPerParent) {
//         toast.warning(`મહત્તમ ${maxChildrenPerParent} સભ્યો ઉમેરી શકાય છે.`, {
//           position: 'top-right',
//           autoClose: 3000,
//         });
//         return;
//       }
//     } else {
//       const findParent = (ms: FamilyMember[]): FamilyMember | null => {
//         for (const m of ms) {
//           if (m.id === parentId) return m;
//           const found = findParent(m.children);
//           if (found) return found;
//         }
//         return null;
//       };
      
//       const parent = findParent(members);
      
//       if (parent && parent.children.length >= maxChildrenPerParent) {
//         let levelText = '';
//         if (newMemberLevel === 1) levelText = 'સંતાનો';
//         else if (newMemberLevel === 2) levelText = 'પૌત્રો';
//         else levelText = 'પ્રપૌત્રો';
        
//         toast.warning(`મહત્તમ ${maxChildrenPerParent} ${levelText} ઉમેરી શકાય છે.`, {
//           position: 'top-right',
//           autoClose: 3000,
//         });
//         return;
//       }
//     }
    
//     if (newMemberLevel >= maxGenerations) {
//       toast.warning(`મહત્તમ ${maxGenerations} પેઢી સુધી ઉમેરી શકાય છે.`, {
//         position: 'top-right',
//         autoClose: 3000,
//       });
//       return;
//     }

//     const newMember: FamilyMember = {
//       id: Date.now().toString(),
//       name: '',
//       age: '',
//       relation: '',
//       hayat: '',
//       birth: '',
//       death: '',
//       children: [],
//     };

//     if (parentId === null) {
//       onChange([...members, newMember]);
//     } else {
//       const updateMembers = (ms: FamilyMember[]): FamilyMember[] => {
//         return ms.map((m) => {
//           if (m.id === parentId) {
//             return { ...m, children: [...m.children, newMember] };
//           }
//           return { ...m, children: updateMembers(m.children) };
//         });
//       };
//       onChange(updateMembers(members));
//     }
//   };

//   const removeMember = (id: string) => {
//     const removeFromTree = (ms: FamilyMember[]): FamilyMember[] => {
//       return ms.filter((m) => m.id !== id).map((m) => ({
//         ...m,
//         children: removeFromTree(m.children),
//       }));
//     };
//     onChange(removeFromTree(members));
//   };

//   const updateMember = (id: string, field: string, value: string) => {
//     const updateInTree = (ms: FamilyMember[]): FamilyMember[] => {
//       return ms.map((m) => {
//         if (m.id === id) {
//           return { ...m, [field]: value };
//         }
//         return { ...m, children: updateInTree(m.children) };
//       });
//     };
//     onChange(updateInTree(members));
//   };

//   const renderMember = (member: FamilyMember, level: number = 0, parentName: string = '') => {
//     const isRoot = level === 0;
//     const canAddChildren = level < maxGenerations - 1;
//     const childrenCount = member.children.length;
//     const canAddMoreChildren = childrenCount < maxChildrenPerParent;
    
//     const generationLabels = ['મુખ્ય', 'સંતાન', 'પૌત્ર', 'પ્રપૌત્ર'];
//     const generationLabel = generationLabels[level] || `પેઢી ${level + 1}`;
    
//     return (
//       <div key={member.id} className="flex flex-col items-center min-w-[180px] max-w-[200px]">
//         {/* Generation Label */}
//         {!isRoot && (
//           <div className="mb-1 text-[10px] font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
//             {generationLabel}
//           </div>
//         )}
        
//         {/* Member Card - Fixed Size */}
//         <div 
//           className={`relative w-full min-h-[100px] border-2 rounded bg-white p-2 shadow-sm 
//             ${isRoot ? 'border-yellow-500' : 'border-gray-300'}`}
//         >
//           {/* Generation Badge for Root */}
//           {isRoot && (
//             <div className="absolute -top-2 left-2 bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">
//               {generationLabel}
//             </div>
//           )}
          
//           {/* Input Grid - Compact Design */}
//           {!showBirthDeath ? (
//             <div className="space-y-1.5">
//               <div className="grid grid-cols-3 gap-1">
//                 <input
//                   type="text"
//                   placeholder="સબંધ"
//                   value={member.relation || ''}
//                   onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
//                   className="col-span-1 w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//                 />
//                 <select
//                   value={member.hayat || ''}
//                   onChange={(e) => updateMember(member.id, 'hayat', e.target.value)}
//                   className="col-span-1 w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//                 >
//                   <option value="">પસંદ</option>
//                   <option value="હયાત">હયાત</option>
//                   <option value="મરણ">મરણ</option>
//                 </select>
//                 <input
//                   type="text"
//                   placeholder="ઉમર"
//                   value={member.age || ''}
//                   onChange={(e) => updateMember(member.id, 'age', e.target.value)}
//                   className="col-span-1 w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//                 />
//               </div>
//               <input
//                 type="text"
//                 placeholder="નામ"
//                 value={member.name || ''}
//                 onChange={(e) => updateMember(member.id, 'name', e.target.value)}
//                 className="w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//               />
//             </div>
//           ) : (
//             <div className="space-y-1.5">
//               <div className="grid grid-cols-3 gap-1">
//                 <input
//                   type="text"
//                   placeholder="સબંધ"
//                   value={member.relation || ''}
//                   onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
//                   className="col-span-1 w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//                 />
//                 <input
//                   type="text"
//                   placeholder="જન્મ"
//                   value={member.birth || ''}
//                   onChange={(e) => updateMember(member.id, 'birth', e.target.value)}
//                   className="col-span-1 w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//                 />
//                 <input
//                   type="text"
//                   placeholder="મરણ"
//                   value={member.death || ''}
//                   onChange={(e) => updateMember(member.id, 'death', e.target.value)}
//                   className="col-span-1 w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//                 />
//               </div>
//               <input
//                 type="text"
//                 placeholder="નામ"
//                 value={member.name || ''}
//                 onChange={(e) => updateMember(member.id, 'name', e.target.value)}
//                 className="w-full border border-gray-300 px-1.5 py-1 text-[11px] rounded focus:border-yellow-500 focus:outline-none text-black"
//               />
//             </div>
//           )}
//         </div>
        
//         {/* Action Buttons */}
//         <div className="flex items-center justify-center gap-1.5 mt-1.5">
//           {canAddChildren && canAddMoreChildren && (
//             <button
//               onClick={() => addMember(member.id)}
//               className="flex items-center gap-1 bg-green-500 hover:bg-green-600 px-2 py-1 text-[10px] font-medium text-white rounded transition-colors"
//               title="નવો સભ્ય ઉમેરો"
//             >
//               <AddIcon className="h-2.5 w-2.5" />
//               <span>ઉમેરો</span>
//             </button>
//           )}
//           {!isRoot && (
//             <button
//               onClick={() => removeMember(member.id)}
//               className="flex items-center justify-center bg-red-500 hover:bg-red-600 px-2 py-1 text-[10px] font-medium text-white rounded transition-colors"
//               title="કાઢી નાખો"
//             >
//               <DeleteIcon className="h-2.5 w-2.5" />
//             </button>
//           )}
//         </div>
        
//         {/* Children Container */}
//         {member.children.length > 0 && (
//           <div className="mt-4 w-full">
//             {/* Connection Line */}
//             <div className="relative flex justify-center mb-2">
//               <div className="h-4 w-0.5 bg-gray-400"></div>
//             </div>
//             {/* Children Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full px-2">
//               {member.children.map((child) => renderMember(child, level + 1, member.name || 'અજ્ઞાત'))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200">
//       {/* Limits Banner - Fixed Height */}
//       <div className="mb-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-4 py-2.5">
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center gap-4">
//             <div className="text-sm font-semibold text-blue-800">
//               <span className="text-black">મહત્તમ પેઢી:</span> 
//               <span className="ml-1 text-yellow-600">{maxGenerations}</span>
//             </div>
//             <div className="text-sm font-semibold text-blue-800">
//               <span className="text-black">પ્રતિ સભ્ય સંતાનો:</span> 
//               <span className="ml-1 text-yellow-600">{maxChildrenPerParent}</span>
//             </div>
//           </div>
//           <div className="text-xs font-medium bg-white px-2 py-1 rounded border border-blue-300 text-blue-700">
//             {showBirthDeath ? 'મરણ: 4 પેઢી સુધી' : 'હયાતી: 3 પેઢી સુધી'}
//           </div>
//         </div>
//       </div>
      
//       {/* Main Tree Container with Fixed Height */}
//       <div 
//         className="w-full border-2 border-gray-300 rounded-lg bg-white overflow-auto"
//         style={{ height: containerHeight }}
//       >
//         <div className="p-3 min-w-max">
//           <div className="flex flex-wrap justify-center gap-4">
//             {members.map((member) => renderMember(member, 0))}
//           </div>
//         </div>
//       </div>
      
//       {/* Add Root Member Button */}
//       <div className="mt-3 flex justify-center">
//         <button
//           onClick={() => addMember(null)}
//           disabled={members.length >= maxChildrenPerParent}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
//             members.length >= maxChildrenPerParent
//               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               : 'bg-yellow-500 hover:bg-yellow-600 text-white'
//           }`}
//         >
//           <AddIcon className="h-4 w-4" />
//           નવો મુખ્ય સભ્ય ઉમેરો
//         </button>
//       </div>
      
//       {/* Scroll Hint */}
//       <div className="mt-2 text-center text-xs text-gray-500">
//         ↔️ પરિવાર વૃક્ષ જોવા સ્ક્રોલ કરો
//       </div>
//     </div>
//   );
// }