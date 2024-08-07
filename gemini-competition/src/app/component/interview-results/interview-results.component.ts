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

  loadInterviewResults(): void {
    this.dataService.getInterviewResult(this.templateId).subscribe(result => {
      this.interviews = result['interviews-generated'];
    });
  }

  viewDetails(interviewId: string): void {
    this.router.navigate(['/interview-details', interviewId]);
    
  }

}
