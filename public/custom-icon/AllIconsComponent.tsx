import CalenderIcon from "./all-icons/CalenderIcon";
import CameraIcon from "./all-icons/CameraIcon";
import DeleteIcon from "./all-icons/DeleteIcon";
import LogoutIcon from "./all-icons/LogoutIcon";
import PhotoGalleryIcon from "./all-icons/PhotoGalleryIcon";
import PlusIcon from "./all-icons/Plus";
import SettingsIcon from "./all-icons/SettingsIcon";
import UploadIcon from "./all-icons/UploadIcon";
import VideoIcon from "./all-icons/VideoIcon";


interface IconProps {
    iconName: string;
    height: string;
    width: string;
    color: string;
    strokeColor?: string;
    strokeWidth?: number;
}

export default function AllIconsComponent({
    iconName,
    height,
    width,
    color,
}: IconProps) {

    return (
        <>
            {iconName === "uploadIcon" && (<UploadIcon height={height} width={width} color={color} />)}
            {iconName === "photoGalleryIcon" && (<PhotoGalleryIcon height={height} width={width} color={color} />)}
            {iconName === "deleteIcon" && (<DeleteIcon />)}
            {iconName === "cameraIcon" && (<CameraIcon height={height} width={width} color={color} />)} 
            {iconName === "calenderIcon" && (<CalenderIcon height={height} width={width} color={color} />)} 
            {iconName === "videoIcon" && (<VideoIcon height={height} width={width} color={color} />)}
            {iconName === "logoutIcon" && (<LogoutIcon height={height} width={width} color={color} />)}
            {iconName === "plusIcon" && (<PlusIcon height={height} width={width} color={color} />)}
            {iconName === "settingsIcon" && (<SettingsIcon height={height} width={width} color={color} />)}
        </>
    );

}
