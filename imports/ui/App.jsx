import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Modal from 'react-modal'
import { SearchResults } from '../api/searchResults.js';
import { Patients } from '../api/patients.js';
import SearchModal from './SearchModal.jsx'
import Patient from './Patient.jsx';
import SearchResult from './SearchResult.jsx'
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  },
};

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
      modalIsOpen: false,
      startIndex: 0,
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.savePt = this.savePt.bind(this);
    this.incrementStartIndex = this.incrementStartIndex.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    this.setState({startIndex: 0})
    Meteor.call('searchResults.insert', text, this.props.currentUser._id)
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  openModal() {
     Meteor.call('searchResults.clearResults');
     this.setState({modalIsOpen: true});
   }


   afterOpenModal() {
     // references are now sync'd and can be accessed.
   }

   closeModal() {
     this.setState({modalIsOpen: false});
   }

  renderPatients() {
    let filteredPatients = this.props.patients;
    if (this.state.hideCompleted) {
      filteredPatients = filteredPatients.filter(patient => !patient.checked);
    }
    return filteredPatients.map((patient) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = patient.owner === currentUserId;

      return (
        <Patient
          key={patient._id}
          patient={patient}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  savePt() {
    this.props.searchResults.map((sr) => {
      if(sr.selected){
        Meteor.call('patients.insert', sr)
      }
    })
  }

  incrementStartIndex(inc){
    this.setState((prevState,props) => {
      return {startIndex: Math.min(Math.max(prevState.startIndex + inc, 0), this.props.searchResults.length - inc)};
    })
  }

  renderSearchResults() {
    const startIndex = this.state.startIndex;
    const endIndex = Math.min(startIndex + 4, this.props.searchResults.length);
    console.log(this.props.searchResults.length)
    console.log(this.state.startIndex)
    return this.props.searchResults.slice(startIndex, endIndex).map((sr) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = sr.owner === currentUserId;

      return (
        <SearchResult
          key={sr._id}
          sr={sr}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1> My patients ({this.props.incompleteCount})</h1>

          <AccountsUIWrapper />


        </header>
        <div>
          <button onClick={this.openModal}>Search for a patient in EMR</button>
          <Modal
           isOpen={this.state.modalIsOpen}
           onAfterOpen={this.afterOpenModal}
           onRequestClose={this.closeModal}
           style={customStyles}
           contentLabel="Example Modal"
          >
          { this.props.currentUser ?
            <form className="new-patient" onSubmit={this.handleSubmit.bind(this)} >
              <input
                type="text"
                ref="textInput"
                placeholder="Search for patient"
              />
            </form> : ''
          }
            <ul>
              {this.renderSearchResults(0)}
            </ul>
          <button
            onClick={this.savePt}
            hidden={(this.props.searchResults.length == 0)}>
            add to my patients
          </button>
          <button
            className="modal-close"
            onClick={this.closeModal}>
            &times;
          </button>
          <button
            className="modal-prev"
            onClick={() => {this.incrementStartIndex(-this.props.inc) } }>
            prev
          </button>
          <button
            className="modal-next"
            onClick={() => {this.incrementStartIndex(this.props.inc) } }>
            next
          </button>
        </Modal>
      </div>

        <ul>
          {this.renderPatients()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  patients: PropTypes.array.isRequired,
  patients: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('patients');
  Meteor.subscribe('searchResults');

  return {
    patients: Patients.find({}, { sort: { createdAt: -1 } }).fetch(),
    searchResults: SearchResults.find({}).fetch(),
    incompleteCount: Patients.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
    inc: 4,
  };
}, App);
