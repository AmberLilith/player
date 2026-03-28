const IconComponent = (
    iconName: string | null,
    fillColor: string | null,
    height: string | null,
    width: string | null
) => {
    const icons: Record<string, string> = {
        "repeat": "M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z",
        "play": "M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z",
        "pause": "M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z",
        "next": "M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z",
        "previous": "M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z",
        "forwards": "M100-240v-480l360 240-360 240Zm400 0v-480l360 240-360 240ZM180-480Zm400 0Zm-400 90 136-90-136-90v180Zm400 0 136-90-136-90v180Z",
        "backwards": "M860-240 500-480l360-240v480Zm-400 0L100-480l360-240v480Zm-80-240Zm400 0Zm-400 90v-180l-136 90 136 90Zm400 0v-180l-136 90 136 90Z",
        "suffle": "M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z",
        "add_music": "M367-167q-47-47-47-113t47-113q47-47 113-47 23 0 42.5 5.5T560-418v-422h240v160H640v400q0 66-47 113t-113 47q-66 0-113-47Zm-87-353v-120H160v-80h120v-120h80v120h120v80H360v120h-80Z",
        "add_playlist": "M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z",
        "remove_playlist": "m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z",
        "trash": "M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
    };
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        height = {height ? height : "24px"}
        viewBox="0 -960 960 960"
        width={width ? width : "24px"}
        fill={fillColor ? fillColor : "#000000"}>
        <path d={iconName ? icons[iconName] : icons["play"]} /></svg>;
};

export default IconComponent;
