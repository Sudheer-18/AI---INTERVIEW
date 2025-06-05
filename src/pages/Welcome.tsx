import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, BrainCircuit, Camera, Share2, CheckCircle2, XCircle } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { startInterview } = useInterview();
  const [cameraAccess, setCameraAccess] = useState(false);
  const [screenAccess, setScreenAccess] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraAccess(true);
      setError('');
      
      // Store the stream in sessionStorage
      const tracks = stream.getTracks();
      sessionStorage.setItem('cameraEnabled', 'true');
      return true;
    } catch (err) {
      setError('Camera access denied. Please allow camera access to continue.');
      setCameraAccess(false);
      return false;
    }
  };

  const requestScreenAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      // Store screen sharing permission in session
      sessionStorage.setItem('screenEnabled', 'true');
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setScreenAccess(true);
      setError('');
      return true;
    } catch (err) {
      setError('Screen sharing access denied. Please allow screen sharing to continue.');
      setScreenAccess(false);
      return false;
    }
  };

  const handleStart = async () => {
    if (!cameraAccess || !screenAccess) {
      setError('Please enable both camera and screen sharing to continue.');
      return;
    }
    
    // Stop the camera preview
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    startInterview();
    navigate('/interview');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-700 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <Bot size={40} />
          </div>
          <h1 className="text-3xl font-bold text-center">AI Interview Assistant</h1>
          <p className="text-blue-100 text-center mt-2">
            Improve your interview skills with our AI assessment
          </p>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Welcome to the AI Interview Assistant! This interactive platform will assess your communication and technical skills through a series of interview questions.
          </p>
          
          <div className="flex items-start mb-8">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <BrainCircuit className="text-blue-700" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Comprehensive Interview Experience</h3>
              <p className="text-gray-600">Answer questions about your experience, skills, and problem-solving abilities</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">Required Access</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Camera className="text-gray-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-800">Camera Access</p>
                    <p className="text-sm text-gray-600">Required for interview recording</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {cameraAccess ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <button
                      onClick={requestCameraAccess}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enable Camera
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Share2 className="text-gray-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-800">Screen Sharing</p>
                    <p className="text-sm text-gray-600">Required for technical demonstrations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {screenAccess ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <button
                      onClick={requestScreenAccess}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enable Sharing
                    </button>
                  )}
                </div>
              </div>

              {cameraAccess && (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                    Camera Preview
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
                <XCircle size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleStart}
            disabled={!cameraAccess || !screenAccess}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              cameraAccess && screenAccess
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Interview
          </button>
        </div>
      </div>
      
      <p className="text-gray-500 mt-8 text-sm text-center">
        © 2025 AI Interview Assistant. This is a demo application.
        <br />
        No data is sent to servers - everything runs in your browser.
      </p>
    </div>
  );
};

export default Welcome;