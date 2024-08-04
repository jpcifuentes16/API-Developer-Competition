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


async function analizeAnswer(filePath, mimeType, question, evaluation) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  try {
    const file = await uploadToGemini(filePath, mimeType);

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: `\nPregunta: ${question}\n\nCriterio de evaluación: ${evaluation}\n\n\n\n\nTranscribe el audio sin perder detalle y asigna un punteo (0-10) tomando en cuenta la pregunta, criterio de evaluación y respuesta.\n\nFormato de respuesta:\n{\n    \"answer\": \"transcription\",\n    \"points\": \"0-10\"\n}`},
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

    var result = await chatSession.sendMessage("");
    result = result.response.text();
    console.log(result);
    return JSON.parse(result);
  } catch (error) {
    console.error('Error in analizeAudio:', error);
    throw new Error(`GoogleGenerativeAI Error: ${error.message}`);
  }
}



async function generateInterviewQuestions(prompt) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  try {

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: prompt}
          ],
        }
      ],
    });

    var result = await chatSession.sendMessage("");
    result = result.response.text();
    console.log(result);
    return formatQuestions(JSON.parse(result));
  } catch (error) {
    console.error('Error in generate questions:', error);
    throw new Error(`GoogleGenerativeAI Error: ${error.message}`);
  }
}

module.exports = {
  generateInterviewQuestions,
  analizeAnswer
};
