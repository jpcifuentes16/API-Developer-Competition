const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");


require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);


async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}


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


async function analizeAudio(filePath, mimeType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  try {
    const file = await uploadToGemini(filePath, mimeType);

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri,
              },
            },
          ],
        }
      ],
    });

    const result = await chatSession.sendMessage("Transcribe el audio sin perder detalle.");
    console.log(result.response.text());
    return result.response.text();
  } catch (error) {
    console.error('Error in analizeAudio:', error);
    throw new Error(`GoogleGenerativeAI Error: ${error.message}`);
  }
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

module.exports = {
  generateInterviewQuestions,
  analizeAudio
};
