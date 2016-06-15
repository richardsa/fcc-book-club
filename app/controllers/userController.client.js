'use strict';

(function() {
    var profileId = document.querySelector('#profile-id') || null;
    var profileUsername = document.querySelector('#profile-username') || null;
    var profileRepos = document.querySelector('#profile-repos') || null;
    var displayName = document.querySelector('#display-name') || null;
    var shareButton = document.querySelector('#shareButton') || null;
    var profId;
    var apiUrl = appUrl + '/api/:id';
    var shareUrl = appUrl + window.location.pathname;

    function updateHtmlElement(data, element, userProperty) {
        console.log(data);
        element.innerHTML = data[userProperty];
    }

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function(data) {
        console.log(data);


        var userObject = JSON.parse(data);
        profId = userObject.id;
        console.log("prof id" + profId);
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

    $("#editForm").bind('submit', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();

        var userName = $("#userName").val();
        var userState = $("#userState").val();
        var userCity = $("#userCity").val();
        if (userName == null || userName == "") {
            alert("Name must be filled out");
            return false;
        } else if (userCity == null || userCity == "") {
            alert("City must be filled out");
            return false;
        } else if (userState == null || userState == "") {
            alert("City must be filled out");
            return false;
        }

        var editUrl = appUrl + "/edit/api/?userName=" + userName + "&userState=" + userState + "&userCity=" + userCity + "&userId=" + profId;
        console.log(editUrl);
          ajaxFunctions.ajaxRequest('POST', editUrl, function() {
              var redirectUrl = appUrl + "/profile";
            window.location = redirectUrl;
            return false;
           // window.location = appUrl + "/profile";
        });
    
        return false;
    });




})();