import React, { useState } from 'react';
import { Mail, MessageCircle, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const ContactWidget = ({ contactInfo,handleMediaClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!contactInfo) return null;

  return (
    <div className="fixed z-50 bottom-6 right-6">
      {!isExpanded ? (
        // Collapsed state - show connect text
        <div 
          onClick={toggleExpanded}
          className="bg-black text-white px-4 py-2 rounded-full shadow-2xl cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-3 group"
        >
          <MessageCircle className="group-hover:rotate-12 transition-transform duration-300" size={20} />
          {/* <span className="font-medium text-sm whitespace-nowrap">Connect with Us</span> */}
        </div>
      ) : (
        // Expanded state - show contact options
        <div className="bg-white shadow-2xl rounded-2xl p-6 min-w-[250px] relative">
          {/* Close button */}
          <button
            onClick={toggleExpanded}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-4 pr-6">
            <h3 className="font-semibold text-gray-800 text-lg">Connect with Hivoco Team</h3>
            <p className="text-gray-500 text-sm">Choose your preferred method</p>
          </div>

          {/* Contact options */}
          <div className="flex flex-col gap-3">
            <button
              onClick={(e) => handleMediaClick(contactInfo?.email, e)}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                <Mail className="text-red-600" size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Email Us</div>
                <div className="text-sm text-gray-500">Get in touch via email</div>
              </div>
            </button>

            <button
              onClick={(e) => handleMediaClick(contactInfo?.number, e)}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <FaWhatsapp className="text-green-600" size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">WhatsApp</div>
                <div className="text-sm text-gray-500">Chat with us instantly</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default ContactWidget
