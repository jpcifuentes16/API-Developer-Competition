import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private afs : AngularFirestore, private fireStorage : AngularFireStorage) { }





  createTemplate(name: string, configuration: string) {
    const mainNodeId = '1axImfxwtufRYaQwuL9O5jyMMeB3';
    const newTemplate = { name: name, configuration: configuration };

    // Crear un ID para el nuevo documento de plantilla
    const id = this.afs.createId();

    // Referencia al nodo principal
    const mainNodeRef = this.afs.collection("root").doc("templates");

    // Agregar el nuevo template en el nodo secundario 'templates'
    mainNodeRef.collection(mainNodeId).doc(id).set(newTemplate)
      .then(() => {
        console.log('Template agregado con éxito');
      })
      .catch((error) => {
        console.error('Error al agregar template: ', error);
      });
  }

}
