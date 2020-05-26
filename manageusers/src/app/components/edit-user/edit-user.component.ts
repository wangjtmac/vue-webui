import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/User';
import { SettingsService } from '../../services/settings.service';


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  id:string;
  user:User = {
  	name:"",
  	email:"",
  	phone:"",
  	balance:0
  }
  disableBalanceOnEdit:boolean = true;
  constructor(
		public flashMessagesService:FlashMessagesService,
  		public router:Router,
  		public userService:UserService,
  		public route:ActivatedRoute,
      public settingsService:SettingsService
  	) { }

  ngOnInit() {
  	this.id = this.route.snapshot.params["id"];
  	this.userService.getUser(this.id).subscribe(user=>{
  		this.user = user;
  	})
  	this.disableBalanceOnEdit = this.settingsService.getSettings().disableBalanceOnEdit;
  }

  onSubmit({value,valid}:{value:User,valid:boolean}){
  	
  	if (!valid) {
  		this.flashMessagesService.show("请填写正确的完整信息!",{cssClass:"alert-danger",timeout:2000});
  		this.router.navigate(["edit-user/"+this.id]);
  	}else{
  		this.userService.updateUser(this.id,value).subscribe(user=>{
  			this.flashMessagesService.show("用户更新成功!",{cssClass:"alert-success",timeout:2000});
  			this.router.navigate(["/user/"+this.id]);
  		})
  		
  	}
  }

}
