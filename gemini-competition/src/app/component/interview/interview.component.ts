import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit {
  interviewId: string = "";
  interviewData: any;
  currentQuestionIndex: number = 0;
  isRecording: boolean = false;
  isRecordingStopped: boolean = false;
  mediaRecorder: any;
  audioChunks: any[] = [];

  constructor(private route: ActivatedRoute, private data: DataService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.interviewId = params.get('id')!;
      this.data.getInterviewData(this.interviewId).subscribe(data => {
        this.interviewData = data;
        console.log(this.interviewData);
      });
    });
  }

  generateVoice(text: string) {
    this.data.generateAudio(text).subscribe((audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    });
  }

  startRecording() {
    this.isRecording = true;
    this.isRecordingStopped = false;
    this.audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new (window as any).MediaRecorder(stream);
      this.mediaRecorder.start();
      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };
    });
  }

  stopRecording() {
    this.isRecording = false;
    this.isRecordingStopped = true;
    this.mediaRecorder.stop();
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    };
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.interviewData.questions.questions.length - 1) {
      this.currentQuestionIndex++;
      this.isRecordingStopped = false;
    }
  }
}
