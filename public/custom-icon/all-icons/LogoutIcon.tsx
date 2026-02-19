import React from 'react'

const LogOutIcon = ({ width = "25", height = "25", color = "black" }: { height: string; width: string; color: string }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" color={color}/>
        </svg>
    )
}

export default LogOutIcon