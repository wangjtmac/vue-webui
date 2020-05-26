import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  id:string;
  user:object;
  hasBalance:boolean = false;
  showBalanceUpdateInput:boolean = false;
  constructor(
  		public route:ActivatedRoute,
  		public userService:UserService,
  		public flashMessagesService:FlashMessagesService,
  		public router:Router
  	) { }

  ngOnInit() {
  	this.id = this.route.snapshot.params["id"];
  	// console.log(this.id);
  	this.userService.getUser(this.id).subscribe(user=>{
  		if (user.balance > 0) {
  			this.hasBalance = true;
  		}
  		this.user = user;

  		console.log(this.user);
  	})
  }

  // 更新
  updateBalance(id:string){
  	this.userService.updateUser(this.id,this.user).subscribe(user=>{
  		// console.log(user);
  		this.flashMessagesService.show("收支已更新!",{cssClass:"alert-success",timeout:2000});
  		this.showBalanceUpdateInput = false;
  		this.router.navigate(['/user/'+this.id]);
  	})
  }

  // 删除
  onDeleteClick(){
    if (confirm("是否确定删除本条用户信息?")) {
      this.userService.deleteUser(this.id).subscribe(user=>{
        this.flashMessagesService.show("用户信息已删除!",{cssClass:"alert-success",timeout:2000});
        this.router.navigate(['/']);
      })
    }
  }

}
