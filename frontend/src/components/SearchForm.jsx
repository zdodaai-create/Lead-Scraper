import React, { useState, useEffect } from 'react';
import { LOCATION_DATA } from '../utils/locationData';
import { BUSINESS_CATEGORIES, POPULAR_CATEGORIES } from '../utils/categoryData';
import { Search, SlidersHorizontal, MapPin, Building2, Radius as RadiusIcon, Hash, Globe, Compass } from 'lucide-react';

const ADMIN_LEVEL_1_LABELS = {
  India: 'State / Union Territory',
  'United States': 'State',
  Australia: 'State / Territory',
  Singapore: 'State / Division',
  Japan: 'Prefecture',
  'United Kingdom': 'Country / Region',
};

const ADMIN_LEVEL_2_LABELS = {
  India: 'District / City',
  'United States': 'City',
  Australia: 'City',
  Singapore: 'Region / Area',
  Japan: 'City / Ward',
  'United Kingdom': 'City',
};

const COUNTRY_CODES = {
  India: 'IN',
  'United States': 'US',
  Australia: 'AU',
  Singapore: 'SG',
  Japan: 'JP',
  'United Kingdom': 'GB',
};

const SearchForm = ({ onSubmit, loading }) => {
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [customCity, setCustomCity] = useState('');

  const [category, setCategory] = useState('Software Companies');
  const [customCategory, setCustomCategory] = useState('');
  const [radiusKm, setRadiusKm] = useState(20);
  const [maxResults, setMaxResults] = useState(100);

  // Filters
  const [minRating, setMinRating] = useState('');
  const [hasPhone, setHasPhone] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);

  const activeCountryCode = COUNTRY_CODES[selectedCountry] || 'IN';
  const admin1Label = ADMIN_LEVEL_1_LABELS[selectedCountry] || 'State / Region';
  const admin2Label = ADMIN_LEVEL_2_LABELS[selectedCountry] || 'District / City';
  const isSingapore = selectedCountry === 'Singapore';

  // Available States / Regions for selected country
  const availableStates = Object.keys(LOCATION_DATA[selectedCountry] || {});

  // Cascading update when Country changes
  useEffect(() => {
    if (availableStates.length > 0) {
      const defaultState = availableStates.includes('Tamil Nadu') ? 'Tamil Nadu' : availableStates[0];
      setSelectedState(defaultState);
      const cities = LOCATION_DATA[selectedCountry]?.[defaultState] || [];
      if (cities.length > 0) {
        setSelectedCity(cities.includes('Chennai') ? 'Chennai' : cities[0]);
      } else {
        setSelectedCity('Custom');
      }
    } else {
      setSelectedState('');
      setSelectedCity(selectedCountry);
    }
  }, [selectedCountry]);

  // Cascading update when State changes
  const availableCities = LOCATION_DATA[selectedCountry]?.[selectedState] || [];
  useEffect(() => {
    if (availableCities.length > 0) {
      setSelectedCity(availableCities[0]);
    } else {
      setSelectedCity('Custom');
    }
  }, [selectedState]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalRegion = selectedCity;
    if (selectedCity === 'Custom' || !selectedCity) {
      finalRegion = customCity || selectedState || selectedCountry;
    } else {
      finalRegion = selectedCity.split('(')[0].trim();
    }

    let finalCategory = category;
    if (category === 'Custom') {
      finalCategory = customCategory.trim() || 'Businesses';
    }

    const payload = {
      country: selectedCountry,
      country_code: activeCountryCode,
      state: isSingapore ? null : selectedState,
      region: finalRegion,
      category: finalCategory,
      radius_km: parseFloat(radiusKm) || 20,
      max_results: parseInt(maxResults, 10) || 100,
      min_rating: minRating !== '' ? parseFloat(minRating) : null,
      has_phone: hasPhone,
      has_website: hasWebsite,
      has_email: hasEmail,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div class="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Compass class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white leading-none">Find Business Leads</h2>
            <p class="text-xs text-slate-400 mt-1">Select Location & Industry Category Filters</p>
          </div>
        </div>
        <span class="hidden sm:inline-block text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold">
          🌍 Active Country: {selectedCountry} ({activeCountryCode})
        </span>
      </div>

      {/* 3-Tier Location Dropdowns Row */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        {/* 1. Country Selection */}
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Globe class="w-3.5 h-3.5 text-blue-400" />
            1. Country *
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            {Object.keys(LOCATION_DATA).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* 2. State / Province / Prefecture / Region */}
        {!isSingapore ? (
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-amber-400" />
              2. {admin1Label} *
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-slate-500" />
              2. State / Division
            </label>
            <div class="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400">
              Not Required (Singapore City-State)
            </div>
          </div>
        )}

        {/* 3. District / City / Ward / Region Area */}
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Compass class="w-3.5 h-3.5 text-emerald-400" />
            3. {admin2Label} *
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            {availableCities.map((cityItem) => (
              <option key={cityItem} value={cityItem}>
                {cityItem}
              </option>
            ))}
            <option value="Custom">Custom City / Area Name...</option>
          </select>

          {selectedCity === 'Custom' && (
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder={`Enter Custom ${admin2Label} Name`}
              required
              class="w-full mt-2 bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 placeholder-slate-500"
            />
          )}
        </div>
      </div>

      {/* Business Category & Industry Filter Row */}
      <div class="space-y-3 mb-5">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Building2 class="w-3.5 h-3.5 text-purple-400" />
            4. Business Category / Industry *
          </label>
          <span class="text-[11px] text-slate-400">Select industry preset or enter custom</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              {Object.entries(BUSINESS_CATEGORIES).map(([industry, items]) => (
                <optgroup key={industry} label={`── ${industry} ──`}>
                  {items.map((catItem) => (
                    <option key={catItem} value={catItem}>
                      {catItem}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="Custom">✍️ Write Custom Category / Query...</option>
            </select>

            {category === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Solar Installers, AI Startups, Real Estate Brokers..."
                required
                class="w-full mt-2 bg-slate-950 border border-purple-500/50 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 placeholder-slate-500"
              />
            )}
          </div>

          <div class="md:col-span-1 flex flex-wrap gap-1.5 items-center">
            {POPULAR_CATEGORIES.slice(0, 4).map((popCat) => (
              <button
                key={popCat}
                type="button"
                onClick={() => setCategory(popCat)}
                className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-colors ${
                  category === popCat
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {popCat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Radius & Max Results Row */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Radius */}
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <RadiusIcon class="w-3.5 h-3.5 text-blue-400" />
            Search Radius (KM)
          </label>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="5">5 KM (Local Area)</option>
            <option value="10">10 KM (City Center)</option>
            <option value="20">20 KM (Metropolitan)</option>
            <option value="50">50 KM (Regional Hub)</option>
            <option value="100">100 KM (Statewide)</option>
            <option value="200">200 KM (Expanded / Multi-City)</option>
          </select>
        </div>

        {/* Max Results */}
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <Hash class="w-3.5 h-3.5 text-blue-400" />
            Maximum Results
          </label>
          <select
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="20">20 Business Leads</option>
            <option value="50">50 Business Leads</option>
            <option value="100">100 Business Leads</option>
            <option value="200">200 Business Leads</option>
            <option value="500">500 Business Leads</option>
            <option value="1000">⚡ Maximum Available (Up to 1000)</option>
          </select>
        </div>
      </div>

      {/* Optional Filters & Action Button Row */}
      <div class="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-5">
          <span class="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <SlidersHorizontal class="w-3.5 h-3.5" />
            Contact & Rating Filters:
          </span>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Any Rating</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>

          <label class="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPhone}
              onChange={(e) => setHasPhone(e.target.checked)}
              class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
            />
            Has Phone
          </label>

          <label class="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasWebsite}
              onChange={(e) => setHasWebsite(e.target.checked)}
              class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
            />
            Has Website
          </label>

          <label class="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasEmail}
              onChange={(e) => setHasEmail(e.target.checked)}
              class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
            />
            Has Email
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          class="bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Searching {selectedCountry}...</span>
            </>
          ) : (
            <>
              <Search class="w-4 h-4" />
              <span>FIND LEADS ({activeCountryCode})</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
