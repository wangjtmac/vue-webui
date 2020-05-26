import {RouterModule, Routes} from '@angular/router' ;
import {HomeComponent} from "./home/home.component";
import {DirectoryComponent} from "./directory/directory.component";
import {ModuleWithProviders} from "@angular/core";
import {AlbumComponent} from "./directory/album/album.component";
import {ArtistComponent} from "./directory/artist/artist.component";
import {MusicComponent} from "./directory/music/music.component";
import {ErrorModelComponent} from "./error-model/error-model.component";

const appRouter:Routes = [
  {path:'' , redirectTo: 'home' , pathMatch :'full'},
  {path:'home', component : HomeComponent },
  {path:'directory', component : DirectoryComponent, children :[
    { path: '', redirectTo: 'album', pathMatch: 'full' },
    { path: 'album', component: AlbumComponent },
    { path: 'artist', component: ArtistComponent },
    { path: 'music', component: MusicComponent }
  ] },

  {path:'**' ,component:ErrorModelComponent }
];

export const routing:ModuleWithProviders = RouterModule.forRoot(appRouter);
