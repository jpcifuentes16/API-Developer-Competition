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



async function getTemplateByName(mainNodeId, templateId) {
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
    const newTemplate = { name: name, configuration: configuration, id: "" };

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


// Ruta para agregar una plantilla
app.post('/api/interview', async (req, res) => {
  try {
    const { name, userId } = req.body;

    // Verificar que los campos necesarios están presentes
    if (!name) {
      return res.status(400).send('Name and configuration are required');
    }


    const questions = await generateInterviewQuestions("test");
    console.log(questions);

    const mainNodeId = userId;
    const newInterview = { 
                            name: name, 
                            questions: [
                              {
                                question:"Question1?",
                                answer: "Answer1",
                                points: "5"
                              },
                              {
                                question:"Question2?",
                                answer: "Answer2",
                                points: "5"
                              }
                            ],
                            id: "" };

    // Crear un ID para el nuevo documento de plantilla
    const id = admin.firestore().collection('root').doc().id;
    newInterview.id = id;

    // Referencia al nodo principal
    const mainNodeRef = admin.firestore().collection('root').doc('interviews');

    // Agregar el nuevo template en el nodo secundario 'interview'
    await mainNodeRef.collection(mainNodeId).doc(id).set(newInterview);

    // Enviar respuesta de éxito
    res.status(201).send({ "message": "interview agregado con éxito" });
  } catch (error) {
    console.error('Error al agregar template: ', error);
    res.status(500).send({ "message": 'Error al agregar interview' });
  }
});





// Iniciar servidor Express
app.listen(3000, () => {
  console.log('Servidor Express iniciado en el puerto 3000');
});
