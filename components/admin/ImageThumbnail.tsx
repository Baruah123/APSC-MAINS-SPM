'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ImageThumbnail({ url, alt }: { url: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={url} 
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{alt}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center">
              <img 
                src={url} 
                alt={alt}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
