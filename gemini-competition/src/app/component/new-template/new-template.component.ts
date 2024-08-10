import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.css']
})
export class NewTemplateComponent {
  formData = {
    templateName: '',
    interviewLanguage: 'Ingles',
    sections: [
      {
        questionCount: 1,
        objective: '',
        evaluationCriteria: ''
      }
    ]
  };

  constructor(private data: DataService, private router : Router) { }

  addSection() {
    this.formData.sections.push({
      questionCount: 1,
      objective: '',
      evaluationCriteria: ''
    });
  }



  onSubmit(form: NgForm) {
    if (form.valid) {
      this.data.createTemplate(this.formData).subscribe(
        response => {
          console.log(response);
          this.router.navigate(['/new-interview']);
        },
        error => {
          console.error('Error:', error);
        }
      );

    }
  }
}
