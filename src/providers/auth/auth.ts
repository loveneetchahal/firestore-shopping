import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import firebase from 'firebase/app';
import { userProfile } from '../../models/user-profile';
import { teamProfile } from '../../models/team-profile';

@Injectable()
export class AuthProvider {
  constructor(
    public afAuth: AngularFireAuth,
    public fireStore: AngularFirestore
  ) {}

  loginUser(email: string, password: string): Promise<firebase.User> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  async createAdminUser(
    email: string,
    password: string
  ): Promise<firebase.User> {
    const adminUser: firebase.User = await this.afAuth.auth.createUserWithEmailAndPassword(
      email,
      password
    );

    const userProfileCollection: AngularFirestoreDocument<
      userProfile
    > = this.fireStore.doc(`userProfile/${adminUser.uid}`);

    userProfileCollection.set({
      id: adminUser.uid,
      email: email,
      teamId: adminUser.uid,
      teamAdmin: true
    });

    const teamProfile: AngularFirestoreDocument<
      teamProfile
    > = this.fireStore.doc(`teamProfile/${adminUser.uid}`);

    teamProfile.set({
      id: adminUser.uid,
      teamAdmin: adminUser.uid,
      groceryList: null
    });

    return adminUser;
  }

  createRegularUser(email: string): Promise<any> {
    const teamAdmin: firebase.User = this.afAuth.auth.currentUser;
    const userCollection: AngularFirestoreCollection<
      any
    > = this.fireStore.collection(
      `teamProfile/${teamAdmin.uid}/teamMemberList`
    );
    const id: string = this.fireStore.createId();

    const regularUser = {
      id: id,
      email: email,
      teamId: teamAdmin.uid
    };

    return userCollection.add(regularUser);
  }

  resetPassword(email: string): Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return this.afAuth.auth.signOut();
  }
}
