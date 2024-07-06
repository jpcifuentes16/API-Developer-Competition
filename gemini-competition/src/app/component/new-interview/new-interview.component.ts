import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';



interface IInterviewTemplate {
  configuration: string;
  id: string;
  name: string;
}

@Component({
  selector: 'app-new-interview',
  templateUrl: './new-interview.component.html',
  styleUrls: ['./new-interview.component.css']
})
export class NewInterviewComponent {
  templates: IInterviewTemplate[] = [];




  constructor(private data: DataService,  private router : Router){}


  ngOnInit(): void
  {
    this.getAllStudents();
  }


  getAllStudents() {

    this.data.getTemplates().subscribe(res => {

      this.templates = res;      

    }, err => {
      alert('Error while fetching student data');
    })

  }



  addTemplate() {
    this.router.navigate(['/new-template']);
  }

  generateLink(index: number) {
    console.log(`Generating link for ${this.templates[index].id}`);
    // Lógica para generar el enlace aquí
  }
}
