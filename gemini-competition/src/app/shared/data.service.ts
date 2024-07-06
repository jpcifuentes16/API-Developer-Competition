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



  createTemplate(name: string, configuration: string) {
    const newTemplate = { name: name, configuration: configuration, userId: localStorage.getItem("uid") };
    return this.postTemplate(newTemplate, "http://localhost:3000/api/templates");
  }


  postTemplate(data: any, apiUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(apiUrl, data, { headers });
  }

}
