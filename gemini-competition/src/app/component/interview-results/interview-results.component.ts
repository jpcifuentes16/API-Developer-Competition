import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-interview-results',
  templateUrl: './interview-results.component.html',
  styleUrls: ['./interview-results.component.css']
})
export class InterviewResultsComponent implements OnInit {
  templateId: string = "";
  name: string = "";
  interviews: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.templateId = params['templateId'];
      this.name = params['name'];
      this.loadInterviewResults();
    });
  }


  removeDuplicatesWithNullPoints(interviews: any[]): any[] {
    const uniqueInterviews = new Map<string, any>();
  
    interviews.forEach(interview => {
      // Si ya existe una entrada para ese nombre y los puntos son null, la ignora.
      if (!uniqueInterviews.has(interview.name) || interview.points !== null) {
        uniqueInterviews.set(interview.name, interview);
      }
    });
  
    // Retorna un array con los valores únicos
    return Array.from(uniqueInterviews.values());
  }

  loadInterviewResults(): void {
    this.dataService.getInterviewResult(this.templateId).subscribe(result => {
      this.interviews = this.removeDuplicatesWithNullPoints(result['interviews-generated']);
    });
  }

  viewDetails(interviewId: string): void {
    this.router.navigate(['/interview-details', interviewId]);
    
  }

}
