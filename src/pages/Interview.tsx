import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, Mic, MicOff, Clock, AlertCircle } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentQuestion,
    questions,
    responses,
    isInterviewComplete,
    addResponse,
    aiTyping,
    timeRemaining,
    startTimer
  } = useInterview();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [personDetected, setPersonDetected] = useState(true);
  const [detectionWarning, setDetectionWarning] = useState('');
  const [showScreenShare, setShowScreenShare] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializeStreams = async () => {
      const cameraEnabled = sessionStorage.getItem('cameraEnabled');
      const screenEnabled = sessionStorage.getItem('screenEnabled');

      if (!cameraEnabled || !screenEnabled) {
        navigate('/');
        return;
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cameraRef.current) {
          cameraRef.current.srcObject = cameraStream;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }

        await tf.ready();
        detectorRef.current = await blazeface.load();
        
        startTimer();
      } catch (error) {
        console.error('Error initializing streams:', error);
        navigate('/');
      }
    };

    initializeStreams();

    return () => {
      if (cameraRef.current?.srcObject) {
        (cameraRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    const detectPerson = async () => {
      if (!detectorRef.current || !cameraRef.current) return;

      try {
        const predictions = await detectorRef.current.estimateFaces(
          cameraRef.current,
          false
        );

        const isPersonPresent = predictions.length > 0;
        setPersonDetected(isPersonPresent);
        setDetectionWarning(
          isPersonPresent ? '' : 'No person detected in camera view'
        );

        animationFrameRef.current = requestAnimationFrame(detectPerson);
      } catch (error) {
        console.error('Error in person detection:', error);
      }
    };

    detectPerson();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInterviewComplete) {
      navigate('/results');
    }
  }, [isInterviewComplete, navigate]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses, aiTyping]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (!personDetected) {
      alert('Please ensure you are visible in the camera view before continuing.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        addResponse(transcript);
        setTranscript('');
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const chatMessages = [];
  
  for (let i = 0; i < currentQuestion; i++) {
    const question = questions[i];
    const response = responses.find(r => r.questionId === question.id);
    
    chatMessages.push({
      type: 'ai',
      text: question.text
    });
    
    if (response) {
      chatMessages.push({
        type: 'user',
        text: response.text
      });
    }
  }
  
  if (!isInterviewComplete && currentQuestion < questions.length) {
    chatMessages.push({
      type: 'ai',
      text: questions[currentQuestion].text
    });
  }
  
  const progressPercentage = Math.floor((responses.length / questions.length) * 100);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="text-blue-600" size={24} />
            <h1 className="text-xl font-semibold text-gray-800">AI Interview Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            {detectionWarning && (
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <AlertCircle size={16} className="mr-1" />
                <span className="text-sm">{detectionWarning}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
              <Clock size={16} className="text-gray-600" />
              <span className={`font-mono ${timeRemaining <= 30 ? 'text-red-600' : 'text-gray-600'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg relative">
              <video
                ref={cameraRef}
                autoPlay
                muted
                className="w-full h-auto"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                Camera Feed
              </div>
            </div>
            <video
              ref={videoRef}
              autoPlay
              className="hidden"
            />
          </div>
          
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`
                    flex max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 
                    ${message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-4' 
                      : 'bg-white text-gray-700 shadow-sm mr-4'
                    }
                  `}
                >
                  <div className="mr-3 mt-0.5">
                    {message.type === 'user' ? (
                      <User className="text-blue-200\" size={20} />
                    ) : (
                      <Bot className="text-blue-600" size={20} />
                    )}
                  </div>
                  <p className={message.type === 'user' ? 'text-white' : 'text-gray-700'}>
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            
            {isListening && transcript && (
              <div className="flex justify-end animate-fadeIn">
                <div className="bg-blue-100 text-blue-800 rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[70%] ml-4">
                  <p>{transcript}</p>
                </div>
              </div>
            )}
            
            {aiTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white text-gray-700 rounded-2xl px-4 py-3 shadow-sm max-w-[85%] md:max-w-[70%] mr-4">
                  <div className="flex items-center space-x-1">
                    <Bot className="text-blue-600 mr-2" size={20} />
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      <div className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              disabled={aiTyping || !personDetected}
              className={`
                p-6 rounded-full transition-all duration-300
                ${isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}
                ${(aiTyping || !personDetected) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {!personDetected 
              ? "Please ensure you are visible in the camera view"
              : isListening 
                ? "Listening... Click to stop and submit" 
                : "Click the microphone to start speaking"}
          </p>
          {aiTyping && (
            <p className="text-center text-xs text-gray-500 mt-1">AI is thinking...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;