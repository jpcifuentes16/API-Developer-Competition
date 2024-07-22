import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { error } from 'console';



@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private afs : AngularFirestore, private fireStorage : AngularFireStorage, private http: HttpClient) { }



  getTemplates() {

    return this.http.get<any>(`http://localhost:3000/api/templates?userId=${localStorage.getItem("uid")}`);
  }

  getInterviewData(interviewId: string) {

    return this.http.get<any>(` http://localhost:3000/api/interview/${interviewId}`);
  }

  generateAudio(text: string) {
    return this.http.post("http://localhost:3000/api/generate-audio", { text }, { responseType: 'blob' });
  }


  uploadAudio(audioBlob: Blob, interviewId: string, indexQuestion: number){

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('interviewId', interviewId);
    formData.append('questionIndex', indexQuestion.toString());
    return this.http.post('http://localhost:3000/upload-audio', formData)

  }


  createTemplate(name: string, configuration: string) {
    const newTemplate = { name: name, configuration: configuration, userId: localStorage.getItem("uid") };
    return this.postTemplate(newTemplate, "http://localhost:3000/api/templates");
  }

  createInterview(templateId: string, name: string){
    const newInterview = { userId: localStorage.getItem("uid"), templateId: templateId, name: name };
    return this.postTemplate(newInterview, "http://localhost:3000/api/interview");
    
  }


  postTemplate(data: any, apiUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(apiUrl, data, { headers });
  }

}
