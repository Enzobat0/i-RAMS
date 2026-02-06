import React, { useState } from 'react';
import { StopCircle, Navigation, Activity, Video } from 'lucide-react';

const Survey = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50 font-sans text-[#364153]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col min-h-[500px] animate-fadeIn">
        
        {/* Header Area */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight">i-RAMS </h1>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-red-500 font-mono text-sm font-bold animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              RECORDING
            </div>
          )}
        </div>

        {/* Viewfinder / Action Area */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
          {!isRecording ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="text-[#2B7FFF] w-10 h-10" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Ready to Survey</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-[200px] mx-auto">
                Continuous video capture and GPS telemetry will be synchronized on start.
              </p>
              <button 
                onClick={() => setIsRecording(true)}
                className="bg-[#2B7FFF] text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95"
              >
                START SURVEY
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center">
              {/* Camera Viewfinder Placeholder */}
              <div className="w-full aspect-video bg-slate-900 rounded-xl mb-6 relative overflow-hidden shadow-inner flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                <Video className="text-white/20 w-12 h-12" />
                
                {/* Telemetry Status Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg text-[10px] font-mono border border-white/10">
                  <div className="text-gray-400 mb-1 text-[8px]">TELEMETRY STATUS</div>
                  <div className="text-green-400 uppercase tracking-tighter">Syncing GPS...</div>
                </div>
              </div>

              <button 
                onClick={() => setIsRecording(false)}
                className="mt-auto w-full border-2 border-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
              >
                <StopCircle size={20} /> END & SYNC DATA
              </button>
            </div>
          )}
        </div>

        {/* Decorative bottom bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#2B7FFF] via-blue-400 to-[#2B7FFF]"></div>
      </div>
    </div>
  );
};

export default Survey;