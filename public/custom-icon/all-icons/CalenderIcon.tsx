import React from 'react'

const CalenderIcon = ({ width = "25", height = "25", color = "black" }: { height: string; width: string; color: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
            <path d="M8.25 3V7.5M15.75 3V7.5M3.75 9.75H20.25M7.5 12.75V14.25M12 12.75V14.25M16.5 12.75V14.25M16.5 15.75V17.25M12 15.75V17.25M7.5 15.75V17.25M3.75 5.25H20.25V20.25H3.75V5.25Z" stroke={color} strokeLinejoin="round" />
        </svg>
    )
}

export default CalenderIcon