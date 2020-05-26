import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn:boolean;
  loggedInUser:string;
  showRegister:boolean;
  constructor(
  		public authService:AuthService,
  		public flashMessagesService:FlashMessagesService,
  		public router:Router,
      public settingsService:SettingsService
  	) { }

  ngOnInit() {
  	this.authService.getAuth().subscribe(auth=>{
  		if (auth) {
  			this.isLoggedIn = true;
        this.loggedInUser = auth.email;
  		}else {
  			this.isLoggedIn = false;
  		}

      this.showRegister = this.settingsService.getSettings().allowRegistration;
  	})
  }

  onLogoutClick(){
  	this.authService.logout();
  	this.flashMessagesService.show("账号已退出!",{cssClass:"alert-success",timeout:2000});
  	this.router.navigate(["/login"]);
  }

}
