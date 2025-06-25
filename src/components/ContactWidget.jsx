import React from "react";
import { Mail, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const ContactWidget = ({ setIsExpanded, contactInfo }) => {
  return (
    <div
      onMouseMove={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className="absolute z-70 bottom-2 right-4"
    >
      <div className="bg-white shadow-2xl rounded-2xl p-6 min-w-[250px] relative">
        {/* Close button */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-4 pr-6">
          <h3 className="font-semibold text-gray-800 text-lg">
            Connect with Hivoco Team
          </h3>
        </div>

        {/* Contact options */}
        <div className="flex flex-col gap-3">
          <a
            // onClick={(e) => handleMediaClick(contactInfo?.email, e)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            // href={`mailto:${contactInfo?.email}`}
            href={`mailto:${contactInfo?.email}?subject=Inquiry%20about%20Flipbook&body=Hi%2C%20I'm%20interested%20in%20Flipbook.%20Could%20you%20share%20more%20details%3F`}
          >
            <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
              <Mail className="text-red-600" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Email Us</div>
              <div className="text-sm text-gray-500">
                Get in touch via email
              </div>
            </div>
          </a>

          <a
            // onClick={(e) => handleMediaClick(contactInfo?.number, e)}
            // href={`https://wa.me/${contactInfo?.number}`}
            href={`https://wa.me/${contactInfo?.number}?text=Hey%20there!%20I%20am%20interested%20in%20Flipbook`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200 group"
          >
            <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
              <FaWhatsapp className="text-green-600" size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">WhatsApp</div>
              <div className="text-sm text-gray-500">
                Chat with us instantly
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
