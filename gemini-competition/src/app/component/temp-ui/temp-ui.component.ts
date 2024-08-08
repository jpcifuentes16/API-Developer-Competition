import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-temp-ui',
  templateUrl: './temp-ui.component.html',
  styleUrls: ['./temp-ui.component.css']
})
export class TempUIComponent implements OnInit {

  participants = [
    { initial: 'N', name: 'Nate' },
    { initial: 'J', name: 'Jose Sanchez' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
