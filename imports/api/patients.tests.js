/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Patients } from './patients.js';

if (Meteor.isServer) {
  describe('Patients', () => {
    describe('methods', () => {
      const userId = Random.id();
      let patientId;

      beforeEach(() => {
        Patients.remove({});
        patientId = Patients.insert({
          text: 'test patient',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      it('can delete owned patient', () => {
        // Find the internal implementation of the patient method so we can
        // test it in isolation
        const deletePatient = Meteor.server.method_handlers['patients.remove'];

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };

        // Run the method with `this` set to the fake invocation
        deletePatient.apply(invocation, [patientId]);

        // Verify that the method does what we expected
        assert.equal(Patients.find().count(), 0);
      });
    });
  });
}
