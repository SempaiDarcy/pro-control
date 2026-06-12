import { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

export const ProfilePhotoSelector = ({ image, setImage, authChrome = false }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Update the image state
            setImage(file);

            // Generate preview URL from the file
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };
    return (
        <div className={`flex justify-center ${authChrome ? "" : "mb-6"}`}>
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleImageChange}
                className="hidden"
            />

            {!image ? (
                <div
                    className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full ${
                        authChrome ? "bg-zinc-100 ring-1 ring-zinc-200/80" : "bg-blue-100/50"
                    }`}
                >
                    <LuUser
                        className={`text-4xl ${authChrome ? "text-zinc-500" : "text-primary"}`}
                    />

                    <button
                        type="button"
                        className={`absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white ${
                            authChrome ? "bg-zinc-800 hover:bg-zinc-900" : "bg-primary"
                        }`}
                        onClick={onChooseFile}
                    >
                        <LuUpload />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <img
                        src={previewUrl}
                        alt="profile photo"
                        className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1"
                        onClick={handleRemoveImage}
                    >
                        <LuTrash />
                    </button>
                </div>
            )}
        </div>
    );
};

