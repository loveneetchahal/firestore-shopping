const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.createTeamMember = functions.firestore
  .document(`teamProfile/{teamId}/teamMemberList/{newUserId}`)
  .onCreate(event => {
    const id = event.data.data().id;
    const email = event.data.data().email;
    const teamId = event.data.data().teamId;

    return admin
      .auth()
      .createUser({
        uid: id,
        email: email,
        password: '123456789'
      })
      .then(newUser => {
        admin
          .firestore()
          .doc(`userProfile/${newUser.uid}/`)
          .set({
            email: email,
            id: id,
            teamAdmin: false,
            teamId: teamId
          });
      })
      .catch(error => console.error('Error creating the user', error));
  });
