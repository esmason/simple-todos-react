import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const SearchResults = new Mongo.Collection('searchResults');

var mkFhir = require('fhir.js')

var config = {
  // FHIR server base url
  baseUrl: 'http://vonk.furore.com', // 'http://test.fhir.org/r2', //'https://sb-fhir-dstu2.smarthealthit.org/api/
  auth: {
     bearer: 'token',
     // OR for basic auth
     user: 'user',
     pass: 'secret'
  },
  // Valid Options are 'same-origin', 'include'
  credentials: 'same-origin',
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:92/r2',
  }
}

var client = mkFhir(config);
var client2 = mkFhir({baseUrl: 'http://test.fhir.org/r2'})

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish patients that are public or belong to the current user
  Meteor.publish('searchResults', function resultsPublication() {
    return SearchResults.find({}
    );
  })};



async function searchClient(fhirClient, text){
  var patients = await fhirClient
    .search( {type: 'Patient', query: {given: text}})


    if (patients.data.total > 0) {
      return patients.data.entry;
    }
    else {
      return [];
    }
}

async function searchFHIR(text, userId){

var patient_array = await Promise.all([client, client2].map(function(x){ return searchClient(x, text)}))
patient_array = patient_array.reduce(function(a,b){return a.concat(b)}, [])
patient_array.map(function(patient){
  if (patient.resource.name[0].given[0].includes(text)) {
  SearchResults.insert({
        text: patient.resource.name[0].given[0],
        //TODO: unclear whether this identifier is consistent accross time and
        // databases. https://www.hl7.org/fhir/resource.html#identifiers
        identifier: patient.resource.identifier[0].value,
        json: patient,
        createdAt: new Date(),
        owner: userId,
        selected: false,
        username: 'ed1',
      });
    }
})


}





Meteor.methods({
 "searchResults.insert"(text) {
   check(text, String);

    //Make sure the user is logged in before inserting a patient
    if (! this.userId) {
     throw new Meteor.Error('not-authorized');
    }

    Meteor.call('searchResults.clearResults')

     if (Meteor.isServer) {
      patients_list = searchFHIR(text, this.userId)
      .catch(function(res){
        if (res.status){
           console.log('Error', res.status);
            }
          if (res.message){
            console.log('Error ', res.message);
           }
          })
      }
  },
  "searchResults.clearResults"(){
    SearchResults.remove({});
  },
  "searchResults.toggleSelectResult"(resultId, newStatus){
    check(resultId, String);
    check(newStatus, Boolean);
    const sr = SearchResults.findOne(resultId);
    if (sr.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    SearchResults.update(resultId, {$set: {selected: newStatus} });

  },
  "searchResults.addResult"(){

    //TODO
  }

});
