'use client';

import React from 'react';
import { toast } from 'react-toastify';
import { handleGujaratiInput, handleGujaratiPaste } from '@/utils/gujaratiInputValidator';
import AddIcon from '@/public/custom-icon/all-icons/AddIcon';
import DeleteIcon from '@/public/custom-icon/all-icons/DeleteIcon';
import DatePicker from '../DatePicker';

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

interface FamilyTreeProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
  showBirthDeath?: boolean;
  maxChildrenPerParent?: number;
  maxGenerations?: number;
}

const MAX_CHILDREN_PER_PARENT = 10;
const MAX_GENERATIONS_HAYATI = 4;
const MAX_GENERATIONS_MARAN = 4;

const FamilyTree = React.memo(function FamilyTree({
  members,
  onChange,
  showBirthDeath = false,
  maxChildrenPerParent = MAX_CHILDREN_PER_PARENT,
  maxGenerations = showBirthDeath ? MAX_GENERATIONS_MARAN : MAX_GENERATIONS_HAYATI
}: FamilyTreeProps) {


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

  // Unique ID generator using React ref (pure)
  const memberIdCounter = React.useRef(0);
  const getUniqueMemberId = () => {
    memberIdCounter.current += 1;
    return `member-${memberIdCounter.current}`;
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

    const newMemberId = getUniqueMemberId();
    const newMember: FamilyMember = {
      id: newMemberId,
      name: '',
      age: '',
      relation: '',
      hayat: 'મરણ',
      birth: '',
      death: '',
      deathDateType: 'tarikh',
      deathAashre: '',
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

  const renderMember = (member: FamilyMember, level: number = 0, parentName: string = '', isFirstChild: boolean = false, isLastChild: boolean = false, isMultipleChildren: boolean = false) => {
    const isRoot = level === 0;
    const canAddChildren = level < maxGenerations - 1;
    const childrenCount = member.children.length;
    const canAddMoreChildren = childrenCount < maxChildrenPerParent;

    return (
      <div key={member.id} className="flex flex-col items-center justify-center">
        <div
          className={`relative mb-1 border-2 bg-white p-1 sm:p-1.5 shadow-sm min-w-40 sm:min-w-50 max-w-75 sm:max-w-87.5
          ${isRoot
              ? 'border-yellow-500'
              : 'border-gray-400'
            }`}
        >
          {!isRoot && <div className='absolute w-0.5 h-5 bg-gray-400 -top-5 left-1/2 transform -translate-x-1/2'></div>}
          {/* First Row: સબંધ (dropdown), હયાત (dropdown), તારીખ/આશરે (dropdown), તારીખ/ઉંમર - for hayati */}
          {!showBirthDeath ? (() => {
            const status = member.hayat || 'હયાત';
            const isHayat = status === 'હયાત';
            const deathDateType = member.deathDateType || 'tarikh';
            const disableLast3 = isRoot;
            return (
              <div className={`mb-1 flex gap-0.5 sm:gap-1`}>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="સબંધ"
                    value={member.relation || ''}
                    onKeyDown={handleGujaratiInput}
                    onPaste={handleGujaratiPaste}
                    onChange={(e) => updateMember(member.id, 'relation', e.target.value)}
                    className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                  />
                </div>
                <div className={`flex-1 min-w-0${disableLast3 ? ' opacity-60' : ''}`}>
                  <select
                    value={status}
                    onChange={(e) => updateMember(member.id, 'hayat', e.target.value)}
                    disabled={disableLast3}
                    className={`w-full rounded border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] min-h-0 focus:border-yellow-500 focus:outline-none text-black bg-white${disableLast3 ? ' cursor-not-allowed' : ''}`}
                  >
                    <option value="હયાત">હયાત</option>
                    <option value="મરણ">મરણ</option>
                  </select>
                </div>
                {!isHayat && (
                  <div className={`flex-1 min-w-0${disableLast3 ? ' opacity-60' : ''}`}>
                    <select
                      value={deathDateType}
                      onChange={(e) => updateMember(member.id, 'deathDateType', e.target.value)}
                      disabled={disableLast3}
                      className={`w-full rounded border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] min-h-0 focus:border-yellow-500 focus:outline-none text-black bg-white${disableLast3 ? ' cursor-not-allowed' : ''}`}
                    >
                      <option value="tarikh">તારીખ</option>
                      <option value="aashre">આશરે</option>
                    </select>
                  </div>
                )}
                <div className={`flex-1 min-w-0${disableLast3 ? ' opacity-60' : ''}`}>
                  {isHayat ? (
                    <input
                      type="text"
                      placeholder=""
                      value={member.age || ''}
                      onChange={(e) => updateMember(member.id, 'age', e.target.value)}
                      disabled={disableLast3}
                      className={`w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white${disableLast3 ? ' cursor-not-allowed' : ''}`}
                      title="ઉંમર"
                      aria-label="ઉંમર"
                    />
                  ) : (
                    <div className="relative">
                      {deathDateType === 'tarikh' ? (
                        <DatePicker
                          value={member.death || ''}
                          onChange={(value) => updateMember(member.id, 'death', value)}
                          className="w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white"
                          size="small"
                          placeholder="તારીખ"
                          disabled={disableLast3}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="આશરે"
                          value={member.deathAashre || ''}
                          onChange={(e) => updateMember(member.id, 'deathAashre', e.target.value)}
                          onKeyDown={handleGujaratiInput}
                          onPaste={handleGujaratiPaste}
                          disabled={disableLast3}
                          className={`w-full border border-gray-300 px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] focus:border-yellow-500 focus:outline-none text-black bg-white${disableLast3 ? ' cursor-not-allowed' : ''}`}
                          title="આશરે"
                          aria-label="આશરે"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
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
        <div className="flex items-center justify-center gap-1 mt-1">
          {canAddChildren && canAddMoreChildren && (
            <button
              onClick={() => addMember(member.id)}
              className="flex items-center gap-0.5  px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-white transition-colors cursor-pointer"
              title={`Add ${level === 0 ? 'Child' : level === 1 ? 'Grandchild' : 'Great-grandchild'}`}
            >
              <AddIcon height="16" width="16" color="black" />
            </button>
          )}
          {!isRoot && (
            <button
              onClick={() => removeMember(member.id)}
              className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center text-red-700 transition-colors cursor-pointer"
              title="Delete"
            >
              <DeleteIcon height="16" width="16" color="red" />
            </button>
          )}
        </div>

        {/* Children */}
        {member.children.length > 0 && (
          <div className="mt-6 flex flex-col items-center w-full relative">
            {/* Vertical Line from Parent Card down */}
            {/* <div className="w-0.5 h-8 bg-black"></div> */}

            {member.children.length === 1 ? (
              // Single child - just continue vertical line
              <div className="flex flex-col items-center">
                {renderMember(member.children[0], level + 1, member.name, true, true)}
              </div>
            ) : (
              // Multiple children - T-shaped connector
              <div className="relative w-full">
                {/* Children positioned first to calculate positions */}
                <div className="flex justify-center items-start gap-4 sm:gap-6 w-full relative">
                  {member.children.map((child) => {
                    const isFirstChild = child.id === member.children[0].id;
                    const isLastChild = child.id === member.children[member.children.length - 1].id;
                    const isMultipleChildren = member.children.length > 1;
                    return (
                      <div key={child.id} className="flex flex-col items-center relative">
                        {/* Vertical line down to this child */}
                        {(isFirstChild) && <div className='absolute h-0.5 bg-gray-400 -top-5 left-1/2' style={{ width: `calc(50% + 100px)` }}></div>}
                        {(isLastChild) && <div className='absolute h-0.5 bg-gray-400 -top-5 right-1/2' style={{ width: `calc(50% + 100px)` }}></div>}
                        {(!isFirstChild && !isLastChild) && <div className='absolute h-0.5 bg-gray-400 -top-5' style={{ width: `calc(100% + 100px)` }}></div>}
                        {renderMember(child, level + 1, member.name, isFirstChild, isLastChild, isMultipleChildren)}
                      </div>
                    )
                  })}

                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-2 sm:p-4">
      {/* Scrollable Container - Horizontal scroll only */}
      <div className="w-full overflow-x-auto overflow-y-visible border-2 border-gray-200 rounded-lg p-2 sm:p-4 bg-gray-50">
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
    </div>
  );
});

export default FamilyTree;
