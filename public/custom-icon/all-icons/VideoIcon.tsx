import React from 'react'

const VideoIcon = ({ width = "25", height = "25", color = "black" }: { height: string; width: string; color: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 13 13" fill="none">
            <path d="M4.5741 10.2033L8.39723 6.92725C8.45882 6.87445 8.50826 6.80894 8.54215 6.73523C8.57605 6.66152 8.5936 6.58135 8.5936 6.50022C8.5936 6.41909 8.57605 6.33892 8.54215 6.26521C8.50826 6.1915 8.45882 6.126 8.39723 6.07319L4.5741 2.7971C4.20918 2.48444 3.64551 2.74366 3.64551 3.22413V9.77725C3.64551 10.2577 4.20918 10.5169 4.5741 10.2033Z" fill={color} />
        </svg>
    )
}

export default VideoIcon