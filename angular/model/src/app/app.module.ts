import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { DirectoryComponent } from './directory/directory.component';

import {routing} from "./app.router";
import { ArtistComponent } from './directory/artist/artist.component';
import { AlbumComponent } from './directory/album/album.component';
import { MusicComponent } from './directory/music/music.component';
import { ErrorModelComponent } from './error-model/error-model.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    DirectoryComponent,
    ArtistComponent,
    AlbumComponent,
    MusicComponent,
    ErrorModelComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
