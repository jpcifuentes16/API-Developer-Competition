const express = require('express');
const bodyParser = require('body-parser');
const admin = require('./firebaseConfig'); // Import the initialized admin

const generateInterviewQuestions = require('./AIService');

const cors = require('cors');


// Crear aplicación Express
const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json());

app.use(cors());

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



// Ruta para agregar una plantilla
app.post('/api/templates', async (req, res) => {
  try {
    const { name, configuration, userId } = req.body;

    // Verificar que los campos necesarios están presentes
    if (!name || !configuration) {
      return res.status(400).send('Name and configuration are required');
    }

    const mainNodeId = userId;
    const newTemplate = { name: name, configuration: configuration, id: "", "interviews-generated": [] };

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


app.patch('/api/interview/:id/question/:questionIndex', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const questionIndex = req.params.questionIndex;
    const { answer, points } = req.body;

    // Verificar que los campos necesarios están presentes
    if (answer === undefined || points === undefined) {
      return res.status(400).send({ "message": "Answer y points son requeridos" });
    }

    // Obtener el documento de entrevista por ID
    const interviewDoc = await admin.firestore().collection('interviews').doc(interviewId).get();

    if (!interviewDoc.exists) {
      return res.status(404).send({ "message": "Interview no encontrada" });
    }

    // Obtener los datos de la entrevista
    const interviewData = interviewDoc.data();

    // Verificar que el índice de la pregunta es válido
    if (questionIndex < 0 || questionIndex >= interviewData.questions.questions.length) {
      return res.status(400).send({ "message": "Índice de pregunta inválido" });
    }

    // Actualizar los campos answer y points de la pregunta
    interviewData.questions.questions[questionIndex].answer = answer;
    interviewData.questions.questions[questionIndex].points = points;

    // Guardar los cambios en Firestore
    await admin.firestore().collection('interviews').doc(interviewId).set(interviewData);

    // Enviar respuesta de éxito
    res.status(200).send({ "message": "Pregunta actualizada con éxito" });
  } catch (error) {
    console.error('Error al actualizar pregunta: ', error);
    res.status(500).send({ "message": 'Error al actualizar pregunta' });
  }
});








// Iniciar servidor Express
app.listen(3000, () => {
  console.log('Servidor Express iniciado en el puerto 3000');
});
