const express = require('express');
const multer = require('multer');
const { ElevenLabsClient } = require("elevenlabs");
const { createWriteStream, unlink, writeFile } = require("fs");
const path = require("path");
const bodyParser = require('body-parser');
const admin = require('./firebaseConfig');

const { generateInterviewQuestions, analizeAnswer } = require('./AIService');

require('dotenv').config();

const cors = require('cors');


// Crear aplicación Express
const app = express();

const upload = multer({ dest: 'uploads/' });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});


const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};


const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audioStream = await client.generate({
        voice: "George",
        model_id: "eleven_multilingual_v2",
        text,
      });
      const audioBuffer = await streamToBuffer(audioStream);
      const fileName = `elevenlabs.mp3`;
      const filePath = path.join(__dirname, fileName);

      writeFile(filePath, audioBuffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};


// Middleware para parsear JSON
app.use(bodyParser.json());

app.use(cors());


app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  const filePath = path.resolve(req.file.path);
  const mimeType = req.file.mimetype;

  const { interviewId, questionIndex } = req.body;


  // Obtener el documento de entrevista por ID
  const interviewDoc = await admin.firestore().collection('interviews').doc(interviewId).get()
  const interviewData = interviewDoc.data();
  const question = interviewData.questions.questions[questionIndex].question;
  const evaluation = interviewData.questions.questions[questionIndex].evaluation;
  
  try {
    const transcription = await analizeAnswer(filePath, mimeType, question, evaluation);
    await updateAnswer(interviewId,questionIndex, transcription.answer, transcription.points);
    res.json(transcription);
  } catch (error) {
    console.error('Error processing audio file', error);
    res.status(500).send('Error processing audio file');
  }
});


async function updateAnswer(interviewId, questionIndex, answer, points){
  
    // Obtener el documento de entrevista por ID
    const interviewDoc = await admin.firestore().collection('interviews').doc(interviewId).get();

    // Obtener los datos de la entrevista
    const interviewData = interviewDoc.data();

    // Actualizar los campos answer y points de la pregunta
    interviewData.questions.questions[questionIndex].answer = answer;
    interviewData.questions.questions[questionIndex].points = points;

    // Guardar los cambios en Firestore
    await admin.firestore().collection('interviews').doc(interviewId).set(interviewData);


}






// Ruta para obtener plantillas
app.get('/api/templates', async (req, res) => {
  try {
    // Obtener el ID del nodo principal del query parameter
    const mainNodeId = req.query.userId;
    
    // Validar que el mainNodeId esté presente
    if (!mainNodeId) {
      return res.status(400).send('El parámetro mainNodeId es requerido');
    }

    // Referencia al nodo principal
    const mainNodeRef = admin.firestore().collection('root').doc('templates');

    // Obtener referencia a la subcolección
    const templatesRef = mainNodeRef.collection(mainNodeId);

    // Obtener todos los documentos de la subcolección
    const querySnapshot = await templatesRef.get();

    // Mapear los documentos a un array de objetos
    const templates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Enviar respuesta JSON
    res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).send('Error al obtener plantillas');
  }
});



async function getTemplateById(mainNodeId, templateId) {
  // Referencia al nodo principal
  const mainNodeRef = admin.firestore().collection('root').doc('templates');

  // Obtener referencia a la subcolección
  const templatesRef = mainNodeRef.collection(mainNodeId);

  // Hacer una consulta para obtener el documento con el nombre especificado
  const querySnapshot = await templatesRef.where('id', '==', templateId).get();

  if (querySnapshot.empty) {
    console.log('No matching documents.');
    return null;
  }

  // Suponiendo que solo hay un documento con ese nombre
  const doc = querySnapshot.docs[0];
  return doc.data();
}




app.post("/api/generate-audio", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send("Text is required");
  }

  try {
    const filePath = await createAudioFileFromText(text);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        // Delete the file after sending it
        unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Failed to delete file: ${unlinkErr}`);
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send(`Error generating audio: ${error.message}`);
  }
});


function formatTemplateConfiguration(data) {
  let formattedString = `Idioma de la entrevista: ${data.interviewLanguage}. \n`;
  formattedString += 'dada la siguiente estructura de entrevista de reclutamiento, genera preguntas para cada sección: \n\n';
  
  data.sections.forEach((section, index) => {
    formattedString += `Sección ${index + 1}: \n`;
    formattedString += `Objetivo: ${section.objective}. Máximo ${section.questionCount} preguntas para esta sección. \n`;
    formattedString += `Evaluación: ${section.evaluationCriteria}. \n`;
  });

  formattedString += `
Responde en el siguiente formato:
{
"1": {
"questions": ["Pregunta1", ...],
"evaluation": "this section is evaluated as follows..."
}
...
}
  `

  return formattedString;
}



// Ruta para agregar una plantilla
app.post('/api/templates', async (req, res) => {
  try {
    const { data, userId } = req.body;

    // Verificar que los campos necesarios están presentes
    if (!userId || !data) {
      return res.status(400).send('userId and data are required');
    }

    const configuration = formatTemplateConfiguration(data);

    const mainNodeId = userId;
    const newTemplate = { name: data.templateName, configuration: configuration, id: "", "interviews-generated": [] };

    // Crear un ID para el nuevo documento de plantilla
    const id = admin.firestore().collection('root').doc().id;
    newTemplate.id = id;

    // Referencia al nodo principal
    const mainNodeRef = admin.firestore().collection('root').doc('templates');

    // Agregar el nuevo template en el nodo secundario 'templates'
    await mainNodeRef.collection(mainNodeId).doc(id).set(newTemplate);

    // Enviar respuesta de éxito
    res.status(201).send({ "message": "Template agregado con éxito" });
  } catch (error) {
    console.error('Error al agregar template: ', error);
    res.status(500).send({ "message": 'Error al agregar template' });
  }
});


// Agregar link de template, pero cuando se crea un link
// TODO
app.post('/api/templates/:templateId/add-interview', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId, newInterview } = req.body;

    // Verificar que los campos necesarios están presentes
    if (!userId || !newInterview) {
      return res.status(400).send('UserId and newInterview are required');
    }

    // Referencia al nodo principal
    const mainNodeRef = admin.firestore().collection('root').doc('templates');
    const templateRef = mainNodeRef.collection(userId).doc(templateId);

    // Agregar el nuevo elemento al array de 'interviews-generated'
    await templateRef.update({
      'interviews-generated': admin.firestore.FieldValue.arrayUnion(newInterview)
    });

    // Enviar respuesta de éxito
    res.status(200).send({ "message": "Entrevista agregada con éxito" });
  } catch (error) {
    console.error('Error al agregar entrevista: ', error);
    res.status(500).send({ "message": 'Error al agregar entrevista' });
  }
});




app.post('/api/interview', async (req, res) => {
  try {
    const { name, userId, templateId } = req.body;

    // Verificar que los campos necesarios están presentes
    if (!name) {
      return res.status(400).send('Name and configuration are required');
    }

    const template = await getTemplateById(userId, templateId);
    const questions = await generateInterviewQuestions(template.configuration);
    console.log(questions);

    const newInterview = { 
      name: name, 
      questions: questions,
      id: "" 
    };

    // Crear un ID para el nuevo documento de entrevista
    const id = admin.firestore().collection('interviews').doc().id;
    newInterview.id = id;

    // Agregar el nuevo template en la colección 'interviews'
    await admin.firestore().collection('interviews').doc(id).set(newInterview);

    // Agregar el objeto a la lista de interviews-generated en el template
    await admin.firestore().collection('root').doc('templates').collection(userId).doc(templateId).update({
      'interviews-generated': admin.firestore.FieldValue.arrayUnion({
        id: id,
        name: name,
        points: 0
      })
    });

    // Enviar respuesta de éxito
    res.status(201).send({ "message": "Interview agregado con éxito" });
  } catch (error) {
    console.error('Error al agregar interview: ', error);
    res.status(500).send({ "message": 'Error al agregar interview' });
  }
});


// Nueva ruta para obtener una entrevista por ID
app.get('/api/interview/:id', async (req, res) => {
  try {
    const interviewId = req.params.id;
    
    // Obtener el documento de entrevista por ID
    const interviewDoc = await admin.firestore().collection('interviews').doc(interviewId).get();

    if (!interviewDoc.exists) {
      return res.status(404).send({ "message": "Interview no encontrada" });
    }

    // Enviar la información de la entrevista como respuesta
    res.status(200).send(interviewDoc.data());
  } catch (error) {
    console.error('Error al obtener interview: ', error);
    res.status(500).send({ "message": 'Error al obtener interview' });
  }
});




// Nueva ruta para indicar que una entrevista ha terminado
app.post('/api/interview/:id/complete', async (req, res) => {
  try {
    const interviewId = req.params.id;

    // Obtener el documento de entrevista por ID
    const interviewDoc = await admin.firestore().collection('interviews').doc(interviewId).get();
    if (!interviewDoc.exists) {
      return res.status(404).send({ "message": "Interview no encontrada" });
    }

    const interviewData = interviewDoc.data();
    
    // Sumar los puntos de todas las preguntas
    const totalPoints = interviewData.questions.questions.reduce((sum, question) => sum + (parseFloat(question.points) || 0), 0);

    // Obtener el ID de la plantilla asociada a la entrevista
    const templateId = req.body.templateId; // Suponiendo que el templateId se pasa en el body
    const userId = req.body.userId; // Suponiendo que el userId se pasa en el body

    // Actualizar el objeto interviews-generated en la plantilla
    const templateRef = admin.firestore().collection('root').doc('templates').collection(userId).doc(templateId);
    await templateRef.update({
      'interviews-generated': admin.firestore.FieldValue.arrayUnion({
        id: interviewId,
        name: interviewData.name,
        points: totalPoints
      })
    });


    console.log( "Entrevista completada con éxito " + totalPoints);

    // Enviar respuesta de éxito
    res.status(200).send({ "message": "Entrevista completada con éxito", totalPoints });
  } catch (error) {
    console.error('Error al completar entrevista: ', error);
    res.status(500).send({ "message": 'Error al completar entrevista' });
  }
});







// Iniciar servidor Express
app.listen(3000, () => {
  console.log('Servidor Express iniciado en el puerto 3000');
});
