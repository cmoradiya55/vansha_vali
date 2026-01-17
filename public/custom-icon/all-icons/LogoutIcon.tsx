import React from 'react'

const LogoutIcon = ({ height = "13", width = "10", color = "#000000" }: { height: string, width: string, color: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_35220)">
                <path d="M4 18.5H6V20.5H18V4.5H6V6.5H4V3.5C4 3.23478 4.10536 2.98043 4.29289 2.79289C4.48043 2.60536 4.73478 2.5 5 2.5H19C19.2652 2.5 19.5196 2.60536 19.7071 2.79289C19.8946 2.98043 20 3.23478 20 3.5V21.5C20 21.7652 19.8946 22.0196 19.7071 22.2071C19.5196 22.3946 19.2652 22.5 19 22.5H5C4.73478 22.5 4.48043 22.3946 4.29289 22.2071C4.10536 22.0196 4 21.7652 4 21.5V18.5ZM6 11.5H13V13.5H6V16.5L1 12.5L6 8.5V11.5Z" fill={color} />
            </g>
            <defs>
                <clipPath id="clip0_1_35220">
                    <rect width={width} height={height} fill="white" transform="translate(0 0.5)" />
                </clipPath>
            </defs>
        </svg>

    )
}

export default LogoutIcon