import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, BarChart, Undo2, ExternalLink } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { questions, responses, totalScore, restartInterview } = useInterview();
  
  const maxPossibleScore = questions.reduce((total, q) => total + q.maxScore, 0);
  const scorePercentage = Math.round((totalScore / maxPossibleScore) * 100);
  
  const getFeedback = (percentage: number) => {
    if (percentage >= 90) return "Excellent! You've demonstrated outstanding skills and communication abilities.";
    if (percentage >= 75) return "Very good! You show strong capabilities with some room for improvement.";
    if (percentage >= 60) return "Good effort. Consider developing some areas to strengthen your overall performance.";
    if (percentage >= 40) return "You've made a start but need significant improvement in key areas.";
    return "There's substantial room for growth. Consider practicing more before your next interview.";
  };
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold text-center">Your Interview Results</h1>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8 mb-8">
              <div className="relative mb-6 md:mb-0">
                <div className="w-36 h-36 rounded-full border-8 border-blue-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
                      {scorePercentage}%
                    </div>
                    <div className="text-gray-500 text-sm">Overall Score</div>
                  </div>
                </div>
                <Trophy className="absolute -top-2 -right-2 text-yellow-500" size={28} />
              </div>
              
              <div className="md:flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Assessment Summary</h2>
                <p className="text-gray-600 mb-4">{getFeedback(scorePercentage)}</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    You scored <span className="font-semibold">{totalScore}</span> out of a possible <span className="font-semibold">{maxPossibleScore}</span> points based on your responses to {questions.length} questions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Question Analysis</h3>
              <div className="space-y-4">
                {responses.map((response, index) => {
                  const question = questions.find(q => q.id === response.questionId);
                  return (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start mb-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs text-white ${
                          (response.score / (question?.maxScore || 1)) >= 0.7 
                            ? 'bg-green-500' 
                            : (response.score / (question?.maxScore || 1)) >= 0.4 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        } mr-2 flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <h4 className="text-sm font-medium text-gray-800">{question?.text}</h4>
                      </div>
                      <div className="ml-8">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Your response</span>
                          <span>Score: {response.score}/{question?.maxScore}</span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {response.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  restartInterview();
                  navigate('/interview');
                }}
                className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <Undo2 size={18} className="mr-2" />
                Restart Interview
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <ExternalLink size={18} className="mr-2" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-gray-500 text-sm">
          © 2025 AI Interview Assistant. All results are generated using a simple algorithm for demonstration purposes.
        </p>
      </div>
    </div>
  );
};

export default Results;