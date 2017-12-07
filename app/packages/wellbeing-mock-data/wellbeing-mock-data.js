//TODO: Change these for actual group names

var groups = ['Onnela', 'Tammela','Puistola'];
var activities = ['Ulkoilu', 'Retki', 'Tapahtuma (esim. konsertti)',
            'Musiikki','Taide', 'Lukeminen'];

var facilitatorRoles = ['Henkiökunta', 'Vapaaehtoinen', 'Perhe', 'Itse'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function insert(collection, args, amount, insertFunctionOutcome) {
  //make copy of the object so we can get different faker data every time
  var argsWithValues;
  for (var i = 0; i < amount; i++) {
     argsWithValues = Object.assign({},args);

    for (var key in args) {
      if (insertFunctionOutcome) {
        if (typeof args[key] === 'function') {
          var func = args[key];
          argsWithValues[key] = func();
        }
      }
    }
    collection.insert(argsWithValues, {validate: false});

  }
}
function createMockGroups () {
  console.log('Creating mock groups');

  for (var i = 0; i < groups.length; i++) {
    var groupName = groups[i];
    console.log(groupName);
    Groups.insert({'name': groupName});
  }
}

function createMockRoles() {
  console.log('Creating mock roles');

  for (var i = 0; i < facilitatorRoles.length; i++) {
    var roleName = facilitatorRoles[i];
    console.log(roleName);
    Roles.createRole(roleName);
  }
}

function createMockHomes() {
  console.log('Creating mock homes');
  var amount = 3;
  var address = function() {return faker.address.city();};

  for (var i = 0; i < groups.length; i++) {
    var groupName = groups[i];
    console.log(groupName);
    var Group = Groups.findOne({'name': groupName});
    var args = {'name': address,'groupId': Group._id};
    insert(Homes, args, amount, true);
  }

}

function createMockResidents() {
  console.log('Creating mock residents');
  var amount = 6;
  var homes = Homes.find().fetch();
  var firstName = function() {return faker.name.firstName();};
  var lastInitial =  function() {return faker.name.lastName().charAt(0);};
  for (var i = 0; i < homes.length; i++) {
    var args = {'firstName': firstName, 'lastInitial': lastInitial, 'homeId': homes[i]._id};
    insert(Residents, args, amount,true);
  }

}
function createMockActivityTypes() {
  console.log('Creating mock activiity types');
  for (var i = 0; i < activities.length; i++) {
    ActivityTypes.insert({'name': activities[i]});
  }
}

function createMockActivities() {
  console.log('Creating mock activies');
  // Number of activities to create per resident
  var amount =  25;

  // Number, in days, for the earliest activity date
  var earliestActivityDate = 30;

  // Get list of residents
  var residents = Residents.find().fetch();

  // Get list of activity types
  var activityTypes = ActivityTypes.find().fetch();

  // Get a list of all roles, without admin role
  var roles = Meteor.roles.find({name: { $ne: 'admin' } }).fetch();

  // Select a random facilitator role (ID)
  var roleId = function () {
    console.log(roles[Math.floor(Math.random() * roles.length)].name);
    return roles[Math.floor(Math.random() * roles.length)]._id;
  }

  // Get a random activity type (ID)
  var activityType = function() {
    return activityTypes[Math.floor(Math.random() * activityTypes.length)]._id;
  };

  // Get random activity date
  var date = function() {
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(endDate.getDate() - earliestActivityDate);
    return randomDate(endDate, startDate);
  };

  // Set random activity duration
  var duration = function() {
    return Math.floor((Math.random() * 60) + 1);
  };

  for (var i = 0; i < residents.length; i++) {
    var residentId = residents[i]._id;
    var args = {'activityTypeId': activityType, 'activityDate': date,'facilitatorRoleId': roleId,'duration': duration,'residentIds': [residentId]};
    insert(Activities, args, amount, true);
  }
}


function getRandomHomeButExcludeCurrent(current_id) {
  var homeIds = Homes.find().map(function (e) { return e._id; });
  // remove current home from array
  var indexOfCurrent = homeIds.indexOf(current_id);
  if (indexOfCurrent > -1) {
    homeIds.splice(indexOfCurrent, 1);
  }
  //return random element from rest of the homes
  return homeIds[Math.floor(Math.random() * homeIds.length)];
}
  /*
    Get random date from the range of today - startingpoint
    @param start = months from today
    creates two dates one of them being today
    and second one being today minus months set in parameters
  */
function getRandomMoveInDate(start) {
  var endDate = new Date();
  var startDate = new Date();
  startDate.setMonth(endDate.getMonth() - start);
  moveInDate = randomDate(endDate, startDate);
  return moveInDate;
}

  /*
    This function assumes residents are already added.
    then adds residency for every resident
    Depending on the percentMovedOut some residents will have multiple residencies

  */
function createMockResidency(startingPoint, percentMovedOut) {
  console.log("Creating Mock Residencies")
  //get all residents
  var residents = Residents.find().fetch();

  /*  this is the number from where residents are moved out. So if the percentMovedout is 0.25
      this index will be at the 75% percent point of the resident list
      when the loop reaches this index it will move the residents randomly either to another home or just move them out completely
  */
  var indexWhereMovedOut = residents.length - Math.round(residents.length * percentMovedOut)
  for (var i = 0; i < residents.length; i++) {
    moveInDate = getRandomMoveInDate(startingPoint);
    var args = { "residentId": residents[i]._id, 'homeId': residents[i].homeId, 'moveIn': moveInDate }
    if (i >= indexWhereMovedOut) {
      moveOutDate = randomDate(moveInDate, new Date());
      args['moveOut'] = moveOutDate;
      // some residents moved out permanently and some to another house >0.5 moved out permanently < 0.5 new house
      var MovedOutPermanently = Math.random()
      if (MovedOutPermanently < 0.5) {
        var randomHome = getRandomHomeButExcludeCurrent(residents[i].homeId);
        //move them into new house day after they left their old one( adding two days since the UTC 0:0:0 time)
        var newMoveInDate = new Date(moveOutDate.getFullYear(), moveOutDate.getMonth(), moveOutDate.getDate() + 2);
        var newArgs = { "residentId": residents[i]._id, 'homeId': randomHome, 'moveIn': newMoveInDate };
        Residencies.insert(newArgs)
      }
    }
  Residencies.insert(args);
  }
}


Meteor.methods({
  'createMockData': function (start, percentMovedOut) {
    createMockGroups();
    createMockRoles();
    createMockHomes();
    createMockResidents();
    createMockActivityTypes();
    createMockActivities();
    createMockResidency(start, percentMovedOut);
  },
  'createMockGroups': function () {
    createMockGroups();
  },
  'createMockRoles': function () {
    createMockRoles();
  },
  'createMockHomes': function () {
    createMockHomes();
  },
  'createMockResidents': function () {
    createMockResidents();
  },
  'createActivityTypes': function () {
    createMockHomes();
  },
  'createMockActivities': function () {
    createMockActivities();
  },
  'createMockResidency': function (start, percentMovedOut) {
createMockResidency(start, percentMovedOut);
  },
  'removeAllData': function () {
    Groups._dropCollection();
    Homes._dropCollection();
    Residents._dropCollection();
    ActivityTypes._dropCollection();
    Activities._dropCollection();
    Meteor.roles.remove({})
    Residencies._dropCollection();
  },
});
