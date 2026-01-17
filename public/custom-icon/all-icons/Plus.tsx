import React from 'react'

const PlusIcon = ({ width = "25", height = "25", color = "black" }: { height?: string; width?: string; color?: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1671_1788)">
                <path d="M17.6147 17.3335V10.3335H19.948V17.3335H26.948V19.6668H19.948V26.6668H17.6147V19.6668H10.6147V17.3335H17.6147Z" fill={color} />
            </g>
            <defs>
                <clipPath id="clip0_1671_1788">
                    <rect width="28" height="28" fill="white" transform="translate(4.78137 4.5)" />
                </clipPath>
            </defs>
        </svg>
    )
}

export default PlusIcon