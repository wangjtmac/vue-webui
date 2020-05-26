import { Component, OnInit, Input ,Output ,EventEmitter } from '@angular/core';
declare var $:any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Input() person ;
  @Output() onYell = new EventEmitter();
  id:string;
  constructor() { }

  clickFun( $event: any ):void {
    console.log($event.target);
  }
  fireYellFun(){
    this.onYell.emit();
  }
  ngOnInit() {
  }

}
