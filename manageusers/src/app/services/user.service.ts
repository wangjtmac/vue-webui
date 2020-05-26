import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { User } from '../models/User';
import "rxjs/add/operator/map";

@Injectable()
export class UserService {
  constructor(
  	  public http:Http
  	) { }

  getUsers(){
  	return this.http.get("http://localhost:3000/users")
  					.map(res => res.json());
  }

  newUser(user:User){
  	return this.http.post("http://localhost:3000/users",user)
  					.map(res => res.json());
  }

  getUser(id:string){
  	return this.http.get("http://localhost:3000/users/"+id)
  					.map(res => res.json());
  }

  updateUser(id,user){
  	return this.http.put("http://localhost:3000/users/"+id,user)
  					.map(res => res.json());
  }

  deleteUser(id){
  	return this.http.delete("http://localhost:3000/users/"+id)
  					.map(res => res.json());
  }
  

}
