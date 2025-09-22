import React from "react";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../../utils/richtext";

interface DealProps {
  dealTitle: string;
  startDate: string;
  endDate: string;
  body: unknown; // Rich text content
  dealImage?: {
    url: string;
    alt?: string;
  };
}

const Deal: React.FC<DealProps> = ({
  dealTitle,
  startDate,
  endDate,
  body,
  dealImage,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const isExpired = () => {
    const now = new Date();
    const end = new Date(endDate);
    return now > end;
  };

  const getStatusBadge = () => {
    if (isExpired()) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Expired
        </span>
      );
    }
    if (isActive()) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Active
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Upcoming
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Deal Image */}
      {dealImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={dealImage.url}
            alt={dealImage.alt || dealTitle}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      {/* Deal Content */}
      <div className="p-6">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex-1 mr-4">
            {dealTitle}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Dates */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Valid:</span>
          </div>
          <div className="text-sm text-gray-700 ml-6">
            {formatDate(startDate)} - {formatDate(endDate)}
          </div>
        </div>

        {/* Body Content */}
        {body && (
          <div className="prose prose-sm max-w-none">
            <PortableText
              value={transformToPortableText(body)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Deal;
