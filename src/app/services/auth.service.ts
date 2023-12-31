import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {map, tap} from 'rxjs/operators'
import { Usuario } from '../models/usuario.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private dbPath = '/usuario';
  usersRef: AngularFirestoreCollection<Usuario>;
  userSubscription!: Subscription;
  private _user!: Usuario | null;

  get user(){
    return this._user;
  }

  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore,
    private store: Store<AppState>
  ){
    this.usersRef = db.collection(this.dbPath);
  }

  initAuthListener(){
    this.auth.authState.subscribe(fuser => {
      if(fuser){
        // existe
        this.userSubscription = this.db.doc(`${fuser.uid}/usuario`).valueChanges()
        .subscribe((firestoreUser: any) => {
          const user = Usuario.fromFirebase(firestoreUser);
          this._user = user;
          this.store.dispatch(authActions.setUser({user}));
        })
      }else{
        // no existe
        this._user = null;
        this.userSubscription?.unsubscribe();
        this.store.dispatch(authActions.unSetUser());
      }
    })
  }

  crearUsuario(nombre: string, email: string, password: string){
    console.log({nombre, email, password})
    return this.auth.createUserWithEmailAndPassword(email, password)
    .then(({user}) =>{
      const newUser = new Usuario(user!.uid, nombre, user?.email!)
      return this.db.doc(`${user?.uid}/usuario`).set({...newUser})
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
