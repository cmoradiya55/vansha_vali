'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

interface PhotoUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label: string;
  className?: string;
  accept?: string;
}

const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function PhotoUpload({ value, onChange, label, className = '', accept = 'image/*' }: PhotoUploadProps) {
  const [imagePreview, setImagePreview] = useState<string>(value || '');
  const [showDialog, setShowDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update preview when value prop changes
  useEffect(() => {
    setImagePreview(value || '');
  }, [value]);

  // Detect if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDialog(false);
      }
    };

    if (showDialog) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDialog]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('કૃપા કરીને માત્ર ઇમેજ ફાઇલ પસંદ કરો', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ફોટોનું કદ 5MB કરતાં ઓછું હોવું જોઈએ', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      onChange(base64String);
      toast.success('ફોટો અપલોડ થયો', {
        position: 'top-right',
        autoClose: 2000,
      });
    };
    reader.onerror = () => {
      toast.error('ફોટો લોડ કરતી વખતે ભૂલ', {
        position: 'top-right',
        autoClose: 3000,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePlusClick = () => {
    if (!imagePreview) {
      if (isMobile) {
        // On mobile/tablet, show dialog with camera and gallery options
        setShowDialog(true);
      } else {
        // On web/desktop, directly open file picker
        fileInputRef.current?.click();
      }
    }
  };

  const handleCameraClick = () => {
    setShowDialog(false);
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    setShowDialog(false);
    fileInputRef.current?.click();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview('');
    onChange('');
    setShowDialog(false);
    toast.info('ફોટો કાઢી નાખ્યો', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  return (
    <div className={className} ref={containerRef}>
      <label className="mb-1 block text-xs sm:text-sm font-medium text-black">{label}</label>
      
      {imagePreview ? (
        <div className="relative flex justify-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 border-4 border-blue-600 bg-white overflow-hidden shadow-lg" style={{ aspectRatio: '1/1' }}>
            <img
              src={imagePreview}
              alt={label}
              className="w-full h-full object-cover"
            />
            {/* Passport photo corner indicators */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-600"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-600"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-600"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-600"></div>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
            aria-label="Delete photo"
          >
            <DeleteIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative flex justify-center">
          <div 
            className="relative w-32 h-32 sm:w-40 sm:h-40 border-4 border-dashed border-blue-400 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-md"
            style={{ aspectRatio: '1/1' }}
            onClick={handlePlusClick}
          >
            {/* Passport photo corner indicators */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400"></div>
            
            <div className="flex flex-col items-center gap-1 sm:gap-2 z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors shadow-md">
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-600 font-medium text-center px-1">
                {isMobile ? 'ફોટો ઉમેરો' : 'Choose File'}
              </p>
            </div>
          </div>

          {/* Dialog Box - Only for Mobile/Tablet */}
          {showDialog && isMobile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-2xl max-w-xs w-full mx-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 text-center mb-2">
                    ફોટો પસંદ કરો
                  </h3>
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                  >
                    <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base font-medium">કેમેરા</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGalleryClick}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                  >
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base font-medium">ગેલેરી</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    રદ કરો
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        aria-label="Select image from gallery"
      />

      {/* Hidden file input for camera with capture attribute */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        aria-label="Capture photo from camera"
      />
    </div>
  );
}

