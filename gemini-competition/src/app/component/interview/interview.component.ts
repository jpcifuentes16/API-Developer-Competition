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
  mediaRecorder: any;
  audioChunks: any[] = [];

  constructor(private route: ActivatedRoute, private data: DataService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.interviewId = params.get('id')!;
      this.data.getInterviewData(this.interviewId).subscribe(data => {
        this.interviewData = data;
        console.log(this.interviewData);
        this.playQuestionAndRecord();
      });
    });
  }

  playQuestionAndRecord() {
    
    const questionText = this.interviewData.questions.questions[this.currentQuestionIndex].question;
    this.data.generateAudio(questionText).subscribe((audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        this.startRecording();
      };
    });
  }

  startRecording() {
    this.audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new (window as any).MediaRecorder(stream);
      this.mediaRecorder.start();
      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        this.data.uploadAudio(audioBlob, this.interviewId, this.currentQuestionIndex).subscribe(
          (response) => {
            console.log('Audio subido con éxito', response);
            this.nextQuestion();
          },
          (error) => {
            console.error('Error al subir el audio', error);
          }
        );
      };
    });
  }

  stopRecording() {
    this.mediaRecorder.stop();
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.interviewData.questions.questions.length - 1) {
      this.currentQuestionIndex++;
      this.playQuestionAndRecord();
    }
    else
    {
      console.log("Se termino");
      this.data.completedInterview(this.interviewData.author, this.interviewData.templateId, this.interviewId).subscribe( (res) => {
        console.log(res);
        
      });
      
    }
  }
}
