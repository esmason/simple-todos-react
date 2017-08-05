import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Patients = new Mongo.Collection('patients');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish patients that are public or belong to the current user
  Meteor.publish('patients', function patientsPublication() {
    return Patients.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}


Meteor.methods({
 'patients.insert'(sr) {
   check(sr, Object);

    //Make sure the user is logged in before inserting a patient
    if (! this.userId) {
     throw new Meteor.Error('not-authorized');
    }


     if (Meteor.isServer) {
       //TODO: if patient already added let user know
       if (!Patients.findOne({ identifier: sr.identifier }) ){
         Patients.insert({
           identifier: sr.identifier,
           text: sr.text,
           json: sr.json,
           createdAt: sr.createdAt,
           owner: sr.owner,
           username: sr.username,
         });
        }
      }
  },
  'patients.remove'(patientId) {
    check(patientId, String);

    const patient = Patients.findOne(patientId);
    if (patient.private && patient.owner !== this.userId) {
      // If the patient is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Patients.remove(patientId);
  },
  'patients.setChecked'(patientId, setChecked) {
    check(patientId, String);
    check(setChecked, Boolean);

    const patient = Patients.findOne(patientId);
    if (patient.private && patient.owner !== this.userId) {
      // If the patient is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Patients.update(patientId, { $set: { checked: setChecked } });
  },
  'patients.setPrivate'(patientId, setToPrivate) {
    check(patientId, String);
    check(setToPrivate, Boolean);

    const patient = Patients.findOne(patientId);

    // Make sure only the patient owner can make a patient private
    if (patient.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Patients.update(patientId, { $set: { private: setToPrivate } });
  },
});
