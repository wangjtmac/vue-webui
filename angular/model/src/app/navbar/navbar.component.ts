import { Component, OnInit } from '@angular/core';
declare var $:any;
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    var local = window.location.pathname;
    if(local.indexOf('home') != -1 ){
      $('.nav .nav-item:eq(0) a').addClass('active').parent('li').siblings().children('a').removeClass('active');
    }else if(local.indexOf('directory') != -1){
      $('.nav .nav-item:eq(1) a').addClass('active').parent('li').siblings().children('a').removeClass('active');
    }

    $('.nav .nav-item a').click(function(){
      $(this).addClass('active').parent('li').siblings().children('a').removeClass('active');
    })
  }

}
