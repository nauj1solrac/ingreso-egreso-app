import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {map} from 'rxjs/operators'
import { Usuario } from '../models/usuario.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private dbPath = '/usuario';
  usersRef: AngularFirestoreCollection<Usuario>;

  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore
  ){
    this.usersRef = db.collection(this.dbPath);
  }

  initAuthListener(){
    this.auth.authState.subscribe(fuser => {
      console.log(fuser)
      console.log(fuser?.uid)
      console.log(fuser?.email)
    })
  }

  crearUsuario(nombre: string, email: string, password: string){
    console.log({nombre, email, password})
    return this.auth.createUserWithEmailAndPassword(email, password)
    .then(({user}) =>{
      const newUser: Usuario = {
        uid: user?.uid,
        nombre,
        email: user?.email!
      }
      return this.usersRef.add({...newUser});
    })
  }

  loginUsuario(email: string, password: string){
    return this. auth.signInWithEmailAndPassword(email, password);
  }

  logout(){
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    })
  }

  isAuth(){
    return this.auth.authState
    .pipe(
      map(fbUser => fbUser != null)
    )
  }
}
