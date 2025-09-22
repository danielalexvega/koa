import React, { useState } from "react";

interface CampgroundNavigationProps {
  telephone?: string;
  emailAddress?: string;
  directionsLink?: string;
  waysToStay: string[];
  navigation: string[];
}

const CampgroundNavigation: React.FC<CampgroundNavigationProps> = ({
  telephone,
  emailAddress,
  directionsLink,
  waysToStay,
  navigation,
}) => {
  const [formData, setFormData] = useState({
    waysToStay: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    equipment: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="w-full">
      {/* Top Row - Black Background */}
      <div className="bg-black text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Phone */}
              {telephone && (
                <a
                  href={`tel:${telephone}`}
                  className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Reserve: {telephone}</span>
                </a>
              )}

              {/* Email */}
              {emailAddress && (
                <a
                  href={`mailto:${emailAddress}`}
                  className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Email this Campground</span>
                </a>
              )}

              {/* Directions */}
              {directionsLink && (
                <a
                  href={directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Get Directions</span>
                </a>
              )}
            </div>

            {/* Add to Favorites */}
            <button className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>Add to Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row - Yellow Background */}
      <div className="bg-yellow-400 text-black py-4">
        <div className="max-w-7xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-4 flex-wrap">
            {/* Ways to Stay */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold mb-1">Ways To Stay*</label>
              <div className="relative">
                <select
                  value={formData.waysToStay}
                  onChange={(e) => handleInputChange("waysToStay", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded appearance-none bg-white pr-10"
                  required
                >
                  <option value="">Select...</option>
                  {waysToStay.map((way) => (
                    <option key={way} value={way}>
                      {way}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Check In */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-semibold mb-1">Check in*</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange("checkIn", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  required
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Check Out */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-semibold mb-1">Check out*</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange("checkOut", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  required
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-semibold mb-1">Guests</label>
              <select
                value={formData.guests}
                onChange={(e) => handleInputChange("guests", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded appearance-none bg-white pr-10"
              >
                <option value="">Select...</option>
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4 Adults</option>
                <option value="family">Family (2 Adults, 2 Kids)</option>
              </select>
            </div>

            {/* Equipment */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold mb-1">Equipment</label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => handleInputChange("equipment", e.target.value)}
                placeholder="Type/Length/Slideouts"
                className="w-full p-3 border border-gray-300 rounded bg-white"
              />
            </div>

            {/* Submit Button */}
            <div className="flex-1 min-w-[200px]">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span>GET RATES AND AVAILABILITY</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Row - Black Background */}
      <div className="bg-black text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav>
            <ul className="flex items-center space-x-8">
              {navigation.map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="uppercase font-semibold hover:text-yellow-400 transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CampgroundNavigation;
