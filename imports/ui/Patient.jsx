import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

// Patient component - represents a single todo item
export default class Patient extends Component {
  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('patients.setChecked', this.props.patient._id, !this.props.patient.checked);
  }

  deleteThisPatient() {
    Meteor.call('patients.remove', this.props.patient._id);
  }

  togglePrivate() {
    Meteor.call('patients.setPrivate', this.props.patient._id, ! this.props.patient.private);
  }

  componentDidMount() {
  }

  render() {
    // Give patients a different className when they are checked off,
    // so that we can style them nicely in CSS
    const patientClassName = classnames({
      checked: this.props.patient.checked,
      private: this.props.patient.private,
    });

    return (
      <li className={patientClassName}>
        <button className="delete" onClick={this.deleteThisPatient.bind(this)}>
          &times;
        </button>

        <input
          type="checkbox"
          readOnly
          checked={this.props.patient.checked}
          onClick={this.toggleChecked.bind(this)}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.props.patient.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

        <span className="text">
          <strong>{this.props.patient.username}</strong>: {this.props.patient.text}
        </span>
      </li>
    );
  }
}

Patient.propTypes = {
  // This component gets the patient to display through a React prop.
  // We can use propTypes to indicate it is required
  patient: PropTypes.object.isRequired,
  showPrivateButton: React.PropTypes.bool.isRequired,
};
