Template.reportsFiltersDate.onCreated(function () {
  // Get reference to template instance
  const instance = this;

  // Placeholder (reactive variable) for date of oldest activity
  instance.oldestActivityDate = new ReactiveVar();

  // Get date for oldest activity
  Meteor.call('getOldestActivityDate', function (error, oldestActivityDate) {
    // Update reactive variable to contain oldest activity date
    instance.oldestActivityDate.set(oldestActivityDate);
  })
});

Template.reportsFiltersDate.helpers({
  oldestActivityDate () {
    // Get reference to template instance
    const instance = Template.instance();

    // Return the value of oldest activity date reactive variable
    return instance.oldestActivityDate.get();
  }
});
