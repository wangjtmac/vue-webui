import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { SettingsService } from '../../services/settings.service';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  user:User = {
  	name:"",
  	email:"",
  	phone:"",
  	balance:0
  }

  disableBalanceOnAdd:boolean = false;
  constructor(
  		public flashMessagesService:FlashMessagesService,
  		public router:Router,
  		public userService:UserService,
      public settingsService:SettingsService
  	) { }

  ngOnInit() {
    this.disableBalanceOnAdd = this.settingsService.getSettings().disableBalanceOnAdd;
  }

  onSubmit({value,valid}:{value:User,valid:boolean}){
  	// console.log(value);
  	if (this.disableBalanceOnAdd) {
  		value.balance = 0;
  	}
  	if (!valid) {
  		// console.log("验证失败");
  		this.flashMessagesService.show("请填写正确的完整信息!",{cssClass:"alert-danger",timeout:2000});
  		this.router.navigate(["add-user"]);
  	}else{
  		// console.log("验证成功!");
  		this.userService.newUser(value).subscribe(user=>{
  			this.flashMessagesService.show("用户添加成功!",{cssClass:"alert-success",timeout:2000});
  			this.router.navigate(["/"]);
  		})
  		
  	}
  }

}
