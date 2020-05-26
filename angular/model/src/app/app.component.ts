import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  yell(){
    console.log(' I am yelling!');
  }
  person = {
    name : 'Marry',
    age : 18
  }
}
