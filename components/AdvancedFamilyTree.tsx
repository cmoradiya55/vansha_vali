// 'use client';

// import React, { useState } from 'react';
// import type { ReactNode } from 'react';

// interface TreeMember {
//   id: string;
//   name: string;
//   generation: number;
//   parentId?: string;
//   spouseId?: string;
//   position?: { x: number; y: number };
// }

// interface AdvancedFamilyTreeProps {
//   members?: TreeMember[];
//   onMemberUpdate?: (member: TreeMember) => void;
// }

// /**
//  * Advanced Family Tree Component matching the Hayati Pediname design
//  * Uses SVG for precise rendering with dashed lines and diamond boxes
//  */
// const AdvancedFamilyTree: React.FC<AdvancedFamilyTreeProps> = ({ 
//   members = [],
//   onMemberUpdate 
// }) => {
//   // Default tree structure - modify based on actual data
//   const defaultMembers: TreeMember[] = [
//     { id: 'husband', name: 'પતિ', generation: 0, spouseId: 'wife', position: { x: 200, y: 80 } },
//     { id: 'wife', name: 'પત્ની', generation: 0, spouseId: 'husband', position: { x: 300, y: 80 } },
//     { id: 'son1', name: 'પુત્ર-૧', generation: 1, parentId: 'husband', position: { x: 120, y: 220 } },
//     { id: 'daughter1', name: 'પુત્રી-૧', generation: 1, parentId: 'husband', position: { x: 260, y: 220 } },
//     { id: 'son2', name: 'પુત્ર-૨', generation: 1, parentId: 'husband', position: { x: 400, y: 220 } },
//   ];

//   const [treeData] = useState<TreeMember[]>(members.length > 0 ? members : defaultMembers);

//   const SVG_WIDTH = 1000;
//   const SVG_HEIGHT = 500;

//   // Get spouse connection points
//   const getSpouseConnections = () => {
//     const connections: ReactNode[] = [];

//     treeData.forEach(member => {
//       if (member.spouseId && member.position) {
//         const spouse = treeData.find(m => m.id === member.spouseId);
//         if (spouse && spouse.position && member.id < member.spouseId) { // Draw only once
//           const x1 = member.position.x;
//           const y1 = member.position.y + 35;
//           const x2 = spouse.position.x;
//           const y2 = spouse.position.y + 35;
//           const midY = (y1 + y2) / 2 + 30;

//           connections.push(
//             <g key={`spouse-${member.id}-${spouse.id}`}>
//               {/* Line from husband down */}
//               <line
//                 x1={x1}
//                 y1={y1}
//                 x2={x1}
//                 y2={midY}
//                 stroke="#555"
//                 strokeWidth="2"
//                 strokeDasharray="4,4"
//               />
//               {/* Horizontal connection line */}
//               <line
//                 x1={x1}
//                 y1={midY}
//                 x2={x2}
//                 y2={midY}
//                 stroke="#555"
//                 strokeWidth="2"
//                 strokeDasharray="4,4"
//               />
//               {/* Line to wife down */}
//               <line
//                 x1={x2}
//                 y1={midY}
//                 x2={x2}
//                 y2={y2}
//                 stroke="#555"
//                 strokeWidth="2"
//                 strokeDasharray="4,4"
//               />
//               {/* Small circle at center */}
//               <circle cx={(x1 + x2) / 2} cy={midY} r="3" fill="#555" />
//             </g>
//           );
//         }
//       }
//     });

//     return connections;
//   };

//   // Get parent-child connection lines
//   const getChildConnections = () => {
//     const connections: React.ReactNode[] = [];
//     const parentMap = new Map<string, string[]>();

//     // Group children by parent
//     treeData.forEach(member => {
//       if (member.parentId) {
//         if (!parentMap.has(member.parentId)) {
//           parentMap.set(member.parentId, []);
//         }
//         parentMap.get(member.parentId)!.push(member.id);
//       }
//     });

//     // Draw connections
//     parentMap.forEach((childIds, parentId) => {
//       const parent = treeData.find(m => m.id === parentId);
//       if (!parent || !parent.position) return;

//       const children = childIds
//         .map(id => treeData.find(m => m.id === id))
//         .filter((m): m is TreeMember => m !== undefined && m.position !== undefined);

//       if (children.length === 0) return;

//       const parentX = parent.position.x;
//       const parentY = parent.position.y + 35;
//       const childYs = children.map(c => c.position!.y - 40);
//       const minChildY = Math.min(...childYs);
//       const minChildX = Math.min(...children.map(c => c.position!.x));
//       const maxChildX = Math.max(...children.map(c => c.position!.x));
//       const midX = (minChildX + maxChildX) / 2;
//       const midY = parentY + 40;

//       // Vertical from parent
//       connections.push(
//         <line
//           key={`parent-vert-${parentId}`}
//           x1={parentX}
//           y1={parentY}
//           x2={parentX}
//           y2={midY}
//           stroke="#777"
//           strokeWidth="2"
//           strokeDasharray="4,4"
//         />
//       );

//       // Horizontal line across children
//       connections.push(
//         <line
//           key={`parent-horiz-${parentId}`}
//           x1={minChildX}
//           y1={midY}
//           x2={maxChildX}
//           y2={midY}
//           stroke="#777"
//           strokeWidth="2"
//           strokeDasharray="4,4"
//         />
//       );

//       // Vertical to each child
//       children.forEach((child, idx) => {
//         if (!child.position) return;
//         connections.push(
//           <line
//             key={`child-vert-${parentId}-${idx}`}
//             x1={child.position.x}
//             y1={child.position.y - 40}
//             x2={child.position.x}
//             y2={midY}
//             stroke="#777"
//             strokeWidth="2"
//             strokeDasharray="4,4"
//           />
//         );
//       });
//     });

//     return connections;
//   };

//   return (
//     <div className="w-full bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
//       <div className="text-center mb-6">
//         <h3 className="text-lg font-bold text-gray-800">પરિવાર-વૃક્ષ આકૃતિ</h3>
//         <p className="text-xs text-gray-600 mt-1">Family Tree Diagram</p>
//       </div>

//       <div className="flex justify-center overflow-x-auto bg-white p-4 rounded border border-gray-300">
//         <svg
//           width={SVG_WIDTH}
//           height={SVG_HEIGHT}
//           style={{
//             backgroundColor: '#ffffff',
//             minWidth: '100%',
//           }}
//         >
//           {/* Draw connection lines */}
//           <defs>
//             <marker
//               id="arrowhead"
//               markerWidth="10"
//               markerHeight="10"
//               refX="9"
//               refY="3"
//               orient="auto"
//             >
//               <polygon points="0 0, 10 3, 0 6" fill="#555" />
//             </marker>
//           </defs>

//           {/* Connections layer */}
//           <g opacity="0.8">
//             {getSpouseConnections()}
//             {getChildConnections()}
//           </g>

//           {/* Family members - Diamond boxes */}
//           {treeData.map(member => {
//             if (!member.position) return null;

//             const boxWidth = 80;
//             const boxHeight = 55;
//             const x = member.position.x;
//             const y = member.position.y;

//             return (
//               <g key={member.id}>
//                 {/* Diamond/Rectangle box with dashed border */}
//                 <rect
//                   x={x - boxWidth / 2}
//                   y={y - boxHeight / 2}
//                   width={boxWidth}
//                   height={boxHeight}
//                   fill="#ffffff"
//                   stroke="#333333"
//                   strokeWidth="2"
//                   strokeDasharray="5,3"
//                   rx="2"
//                   opacity="0.95"
//                 />

//                 {/* Member name */}
//                 <text
//                   x={x}
//                   y={y - 5}
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   fontSize="13"
//                   fontWeight="bold"
//                   fill="#1a1a1a"
//                   fontFamily="Arial, sans-serif"
//                 >
//                   {member.name}
//                 </text>

//                 {/* Generation indicator */}
//                 <text
//                   x={x}
//                   y={y + 12}
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   fontSize="10"
//                   fill="#666666"
//                   fontFamily="Arial, sans-serif"
//                 >
//                   પેઢી {member.generation + 1}
//                 </text>

//                 {/* ID reference (optional) */}
//                 <text
//                   x={x}
//                   y={y + 22}
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   fontSize="8"
//                   fill="#999999"
//                   fontFamily="Arial, sans-serif"
//                 >
//                   ({member.id})
//                 </text>
//               </g>
//             );
//           })}
//         </svg>
//       </div>

//       {/* Legend */}
//       <div className="mt-4 px-4 py-3 bg-gray-50 rounded border border-gray-200 text-xs">
//         <p className="text-gray-700">
//           <span className="font-semibold">◆ = પરિવાર સભ્ય</span>
//           <span className="mx-3">|</span>
//           <span className="font-semibold">━━━ = સંબંધ (વિવાહ/માતા-પિતા)</span>
//         </p>
//         <p className="text-gray-600 mt-2 italic">Note: Dashed lines indicate family relationships and generational hierarchy</p>
//       </div>
//     </div>
//   );
// };

// export default AdvancedFamilyTree;
