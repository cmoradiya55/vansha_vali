import React from 'react'

const AddIcon = ({ width = "25", height = "25", color = "black" }: { height: string; width: string; color: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" color={color} />
        </svg>
    )
}

export default AddIcon