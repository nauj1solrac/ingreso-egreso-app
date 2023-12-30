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
      // console.log(fuser?.uid)
      // console.log(fuser)
      // console.log(fuser?.email)

      if(fuser){
        // existe
        // this.db.collection('usuario', ref => ref.where('uid', '==', fuser.uid)).valueChanges()
        this.userSubscription = this.db.collection(this.dbPath, ref => ref.where('uid', '==', fuser.uid)).valueChanges({ fields: ['nombre', 'email', 'uid'] })
        .subscribe((firestoreUser: any) => {
          const user = Usuario.fromFirebase(firestoreUser[0]);
          this.store.dispatch(authActions.setUser({user}));
        })
      }else{
        // no existe
        this.userSubscription.unsubscribe();
        this.store.dispatch(authActions.unSetUser());
      }
    })
  }

  crearUsuario(nombre: string, email: string, password: string){
    console.log({nombre, email, password})
    return this.auth.createUserWithEmailAndPassword(email, password)
    .then(({user}) =>{
      const newUser = new Usuario(user?.uid, nombre, user?.email!)
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
