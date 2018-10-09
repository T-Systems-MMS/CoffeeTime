import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'frontend';
  joke = null;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.dataService.fetchData().subscribe(
      response => { this.joke = response; },
      error => { console.log(error); }
    );
  }
}
