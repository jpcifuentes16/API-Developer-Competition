const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


function formatQuestions(newInputFormat) {
  const newFormat = { questions: [] };

  Object.keys(newInputFormat).forEach(section => {
      const evaluation = newInputFormat[section].evaluation;
      newInputFormat[section].questions.forEach(question => {
          newFormat.questions.push({
              section: parseInt(section),
              question: question,
              answer: "NA",
              points: "0",
              evaluation: evaluation
          });
      });
  });

  return newFormat;
}



async function generateInterviewQuestions(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const questionsGemini = JSON.parse(text.toString().replace("```json","").replace("```",""));
    return formatQuestions(questionsGemini);
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
}

module.exports = generateInterviewQuestions;
