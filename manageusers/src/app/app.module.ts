import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// 引入路由
import { RouterModule,Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';

// 引入组件
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { UsersComponent } from './components/users/users.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import { PageNotFountComponent } from './components/page-not-fount/page-not-fount.component';

// 引入服务
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RegisterGuard } from './guards/register.guard';
import { SettingsService } from './services/settings.service';

// 设置路由
const appRoutes:Routes = [
  {path:"",component:HomeComponent,canActivate:[AuthGuard]},
  {path:"login",component:LoginComponent},
  {path:"register",component:RegisterComponent,canActivate:[RegisterGuard]},
  {path:"add-user",component:AddUserComponent,canActivate:[AuthGuard]},
  {path:"user/:id",component:UserDetailComponent,canActivate:[AuthGuard]},
  {path:"edit-user/:id",component:EditUserComponent,canActivate:[AuthGuard]},
  {path:"settings",component:SettingsComponent,canActivate:[AuthGuard]}
]

export const firebaseConfig = {
    apiKey: "AIzaSyBHjGuP1MYzB0VrOJ4WjEy3C9z-t09LLXQ",
    authDomain: "manageuser-85b5e.firebaseapp.com",
    databaseURL: "https://manageuser-85b5e.firebaseio.com",
    storageBucket: "manageuser-85b5e.appspot.com",
    messagingSenderId: "751269160862"
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UsersComponent,
    UserDetailComponent,
    AddUserComponent,
    EditUserComponent,
    NavbarComponent,
    SidebarComponent,
    LoginComponent,
    RegisterComponent,
    SettingsComponent,
    PageNotFountComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    FlashMessagesModule,
    RouterModule.forRoot(appRoutes),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [
    UserService,
    AngularFireAuth,
    AuthService,
    AuthGuard,
    RegisterGuard,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
