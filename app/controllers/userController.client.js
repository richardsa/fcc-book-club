'use strict';

(function() {
    var profileId = document.querySelector('#profile-id') || null;
    var profileUsername = document.querySelector('#profile-username') || null;
    var profileRepos = document.querySelector('#profile-repos') || null;
    var displayName = document.querySelector('#display-name') || null;
    var shareButton = document.querySelector('#shareButton') || null;
    var apiUrl = appUrl + '/api/:id';
    var shareUrl = appUrl + window.location.pathname;

    function updateHtmlElement(data, element, userProperty) {
       console.log(data);
        element.innerHTML = data[userProperty];
    }

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function(data) {
       console.log(data);


        var userObject = JSON.parse(data);
        if (userObject.hasOwnProperty('error')) {
            document.querySelector("#loginButton").innerHTML = '<a href="/login">Login</a>';
            return;
        } else {
            document.querySelector("#loginButton").innerHTML = '<a href="/logout">Logout</a>'
            document.querySelector("#profileLink").innerHTML = '<a href="/profile">Profile</a>'
            document.querySelector("#searchLink").innerHTML = '<a href="/search">Search</a>'

            if (displayName !== null) {
                updateHtmlElement(userObject, displayName, 'displayName');
            }

            if (profileId !== null) {
                updateHtmlElement(userObject, profileId, 'id');
            }

            if (profileUsername !== null) {
                updateHtmlElement(userObject, profileUsername, 'username');
            }

            if (profileRepos !== null) {
                updateHtmlElement(userObject, profileRepos, 'publicRepos');
            }
        }
    }));



})();