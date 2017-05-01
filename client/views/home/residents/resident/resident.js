Template.homeResident.created = function () {
  // Get reference to template instance
  var instance = this;

  // Get resident ID as instance variable, for clarity
  instance.residentId = instance.data._id;

  // Create resident activity count reactive variable
  instance.residentActivityCount = new ReactiveVar();

  // Get resident activity count from server, and set reactive variable
  Meteor.call('getResidentRecentActivitiesCount', instance.residentId, function (error, activityCount) {
    // set the value of the resident activity count reactive variable
    instance.residentActivityCount.set(activityCount);
  });
};

Template.homeResident.helpers({
  'activityLabelClass': function () {
    // Get reference to template instance
    var instance = Template.instance();

    // Get resident
    const resident = instance.data;

    // Check if resident is on hiatus
    if (resident.onHiatus) {
      return 'info';
    }

    // Get resident activity count
    var activityCount = instance.residentActivityCount.get();

    // Case for returning Bootstrap class based on activity level
    if (activityCount >= 5) {
      return 'success';
    } else if ( activityCount > 0 && activityCount < 5 ) {
      return 'warning';
    } else if ( activityCount === 0 ) {
      return 'danger';
    }
  },
   'activityLabelText': function () {
    // Get reference to template instance
    var instance = Template.instance();

    // Map the resident activity level to a Bootstrap class

    // Get resident
    const resident = instance.data;

    // Check if resident is on hiatus
    if (resident.onHiatus) {
      // Get localized text for 'on hiatus' status
      const onHiatusText = TAPi18n.__('homeResident-activityLabelText-onHiatus');

      return onHiatusText;
    }

    // Get resident ID from template instance
    var residentId = instance.residentId;

    // Get resident activity count
    var activityCount = instance.residentActivityCount.get();

    // Get activity level translations
    const active = TAPi18n.__("residentActivityLevel-active");
    const semiActive = TAPi18n.__("residentActivityLevel-semiActive");
    const inactive = TAPi18n.__("residentActivityLevel-inactive");

    // Case for returning Bootstrap class based on activity level
    if (activityCount >= 5) {
      return active;
    } else if ( activityCount > 0 && activityCount < 5 ) {
      return semiActive;
    } else if ( activityCount === 0 ) {
      return inactive;
    }
  },
  'activityCount': function () {
    // Get reference to template instance
    var instance = Template.instance();

    // Get resident activity count
    var activityCount = instance.residentActivityCount.get();

    // Return the activity count as a string
    return activityCount;
  }
});

Template.homeResident.events({
  'click .resident': function () {
    // Get ID of clicked resident
    var residentId = this._id;

    // Show page for clicked resident
    Router.go('resident', {residentId: residentId});
  }
});
