export const allQuestions = [
  {
    id: 1,
    text: "Tell me about a time when you had to explain a complex idea to someone. How did you ensure they understood?",
    maxScore: 10,
  },
  {
    id: 2,
    text: "Describe a situation where you had to give constructive feedback to a colleague. How did you approach it?",
    maxScore: 10,
  },
  {
    id: 3,
    text: "How do you adapt your communication style when speaking with different stakeholders?",
    maxScore: 10,
  },
  {
    id: 4,
    text: "Tell me about a time when you had to handle a difficult conversation. What was your approach?",
    maxScore: 10,
  },
  {
    id: 5,
    text: "How do you ensure effective communication in a remote or virtual work environment?",
    maxScore: 10,
  },
  {
    id: 6,
    text: "Describe a situation where you had to persuade someone to see things from your perspective.",
    maxScore: 10,
  },
  {
    id: 7,
    text: "How do you handle communication breakdowns or misunderstandings in a professional setting?",
    maxScore: 10,
  },
  {
    id: 8,
    text: "Tell me about a time when you had to communicate bad news to someone. How did you handle it?",
    maxScore: 10,
  },
  {
    id: 9,
    text: "How do you ensure your written communication is clear and effective?",
    maxScore: 10,
  },
  {
    id: 10,
    text: "Describe a situation where you had to communicate with someone who was resistant to your ideas.",
    maxScore: 10,
  }
];

export const getRandomQuestions = (count: number) => {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};