import React, { useState } from 'react';
import { MapPin, Pill, Loader2, AlertTriangle, ExternalLink, Star, Stethoscope } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface PlaceLink {
  uri?: string;
  title?: string;
  reviewSnippets?: string[];
}

export function NearbyServices() {
  const [activeSubTab, setActiveSubTab] = useState<'doctors' | 'pharmacies'>('doctors');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseMarkdown, setResponseMarkdown] = useState<string>('');
  const [places, setPlaces] = useState<PlaceLink[]>([]);

  const handleSearch = async (serviceType: 'doctors' | 'pharmacies') => {
    setIsLoading(true);
    setError(null);
    setResponseMarkdown('');
    setPlaces([]);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

          const prompt = serviceType === 'doctors'
            ? 'What are the best doctors, clinics, or hospitals nearby? Please provide a brief overview of the top options.'
            : 'What are the best pharmacies, chemists, or medical stores nearby? Please provide a brief overview of the top options.';

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              tools: [{ googleMaps: {} }],
              toolConfig: {
                retrievalConfig: {
                  latLng: {
                    latitude,
                    longitude,
                  },
                },
              },
            },
          });

          setResponseMarkdown(response.text || 'No information found.');

          // Extract places from grounding chunks
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const extractedPlaces: PlaceLink[] = [];

          chunks.forEach((chunk: any) => {
            if (chunk.maps) {
              extractedPlaces.push({
                uri: chunk.maps.uri,
                title: chunk.maps.title,
                reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || [],
              });
            }
          });

          setPlaces(extractedPlaces);
        } catch (err: any) {
          setError(err.message || `An error occurred while fetching nearby ${serviceType === 'doctors' ? 'doctors' : 'medical stores'}.`);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setError('Unable to retrieve your location. Please ensure location permissions are granted.');
        console.error(geoError);
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Selection */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200 shadow-sm">
        <button
          onClick={() => {
            setActiveSubTab('doctors');
            setResponseMarkdown('');
            setPlaces([]);
            setError(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeSubTab === 'doctors'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Doctors & Clinics
        </button>
        <button
          onClick={() => {
            setActiveSubTab('pharmacies');
            setResponseMarkdown('');
            setPlaces([]);
            setError(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeSubTab === 'pharmacies'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          Pharmacies & Chemists
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white p-6 md:p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
            activeSubTab === 'doctors' 
              ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {activeSubTab === 'doctors' ? <MapPin className="w-7 h-7" /> : <Pill className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {activeSubTab === 'doctors' ? 'Find Nearby Healthcare' : 'Find Nearby Medical Stores'}
            </h2>
            <p className="text-slate-600 mt-2 max-w-md mx-auto">
              {activeSubTab === 'doctors' 
                ? 'Discover top-rated doctors, clinics, and hospitals in your immediate area using Google Maps.'
                : 'Discover top-rated pharmacies and chemists in your immediate area using Google Maps.'}
            </p>
          </div>
          <button
            onClick={() => handleSearch(activeSubTab)}
            disabled={isLoading}
            className={`mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md ${
              activeSubTab === 'doctors'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                {activeSubTab === 'doctors' ? 'Find Doctors Near Me' : 'Find Pharmacies Near Me'}
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {(responseMarkdown || places.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white p-6 md:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">Overview</h3>
              <div className={`prose prose-slate max-w-none ${
                activeSubTab === 'doctors' ? 'prose-indigo' : 'prose-emerald'
              }`}>
                <Markdown>{responseMarkdown}</Markdown>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Locations Found</h3>
            {places.length > 0 ? (
              <div className="space-y-3">
                {places.map((place, index) => (
                  <a
                    key={index}
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group ${
                      activeSubTab === 'doctors'
                        ? 'hover:border-indigo-300'
                        : 'hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-medium text-slate-900 transition-colors ${
                        activeSubTab === 'doctors'
                          ? 'group-hover:text-indigo-600'
                          : 'group-hover:text-emerald-600'
                      }`}>
                        {place.title || 'Unknown Location'}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    </div>
                    {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {place.reviewSnippets.slice(0, 2).map((snippet, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <span className="italic">"{snippet}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500 text-center">
                No specific map locations were returned.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
