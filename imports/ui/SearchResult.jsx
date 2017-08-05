import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

// SearchResult component - represents a single todo item
export default class SearchResult extends Component {
  toggleSelectResult() {
    //select result to be loaded into SearchResults
    Meteor.call('searchResults.toggleSelectResult', this.props.sr._id, !this.props.sr.selected)
  }

  addResult() {
    //adds result to SearchResults
    Meteor.call('searchResults.addResult', this.props.sr._id)
  }

  componentDidMount() {
  }

  render() {
    // Give SearchResults a different className when they are checked off,
    // so that we can style them nicely in CSS
    const patientClassName = classnames({
      //TODO: css for selected patient
      checked: this.props.sr.selected,
    });

    return (
        // <input
        //   type="checkbox"
        //   readOnly
        //   checked={this.props.sr.selected}
        //   onClick={this.toggleSelectResult.bind(this)}
        // />
        <li
          className ={patientClassName}
          onClick={this.toggleSelectResult.bind(this)}
          >
        <span className="text">
          <strong>{this.props.sr.username}</strong>: {this.props.sr.text}
        </span>
      </li>
    );
  }
}

SearchResult.propTypes = {
  // This component gets the patient to display through a React prop.
  // We can use propTypes to indicate it is required
  sr: PropTypes.object.isRequired,
};
