'use strict';

(function() {
  var profileId = document.querySelector('#profile-id') || null;
  var profileUsername = document.querySelector('#profile-username') || null;
  var profileCity = document.querySelector('#profile-city') || null;
  var profileState = document.querySelector('#profile-state') || null;
  var profileRepos = document.querySelector('#profile-repos') || null;
  var displayName = document.querySelector('#display-name') || null;
  var shareButton = document.querySelector('#shareButton') || null;
  var profileBooks = document.querySelector('#profileBooks') || null;
  var requestedBooks = document.querySelector('#requestedBooks') || null;
  var deniedRequestedBooks = document.querySelector('#deniedRequests') || null;
  var approvedRequestedBooks = document.querySelector('#approvedRequests') || null;
  var profId;
  var apiUrl = appUrl + '/api/:id';
  var shareUrl = appUrl + window.location.pathname;

  function updateHtmlElement(data, element, userProperty) {
    element.innerHTML = data[userProperty];
  }

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function(data) {
    var userObject = JSON.parse(data);
    profId = userObject.id;
    if (userObject.hasOwnProperty('error')) {
      document.querySelector("#loginButton").innerHTML = '<a href="/login">Login</a>';
      return;
    } else {
      document.querySelector("#loginButton").innerHTML = '<a href="/logout">Logout</a>'
      document.querySelector("#profileLink").innerHTML = '<a href="/profile">Profile</a>'
      document.querySelector("#searchLink").innerHTML = '<a href="/search">Search</a>'
      document.querySelector("#allBooksLink").innerHTML = '<a href="/books">All Books</a>'

      if (window.location.pathname === "/profile") {
        ajaxFunctions.ajaxRequest('GET', appUrl + "/profile/api/" + profId, getBooks);
        ajaxFunctions.ajaxRequest('GET', appUrl + "/request/api/" + profId, getRequests);
        ajaxFunctions.ajaxRequest('GET', appUrl + "/deniedrequests/api/" + profId, getDenied);
        ajaxFunctions.ajaxRequest('GET', appUrl + "/approvedrequests/api/" + profId, getApproved);
      }

      if (displayName !== null) {
        updateHtmlElement(userObject, displayName, 'displayName');
      }

      if (profileId !== null) {
        updateHtmlElement(userObject, profileId, 'id');
      }

      if (profileCity !== null) {
        updateHtmlElement(userObject, profileCity, 'city');
      }
      if (profileState !== null) {
        updateHtmlElement(userObject, profileState, 'state');
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
    ajaxFunctions.ajaxRequest('POST', editUrl, function() {
      var redirectUrl = appUrl + "/profile";
      window.location = redirectUrl;
      return false;
    });

    return false;
  });


  // function to add books to personal collection    
  function addBook(data) {
    var response = JSON.parse(data);
    // if not logged in redirect to login page
    if (response.hasOwnProperty('error')) {
      alert(response.error);
      return;
    } else {
      var addClass = "." + response.bookId;
      $("#searchResults").find(addClass).removeClass("addBtn").addClass("addedButton").text("Added");
    }
  }

  // function to request books     
  function requestBook(data) {
    var response = JSON.parse(data);
    if (response.hasOwnProperty('error')) {
      alert(response.error);
      return;
    } else {
      var addClass = "." + response.bookId;
      $("#allBooks").find(addClass).removeClass("requestBtn").addClass("requestedButton").html("<p>Cancel Request</p>");
    }
  }

  // jquery add books to collection function
  $("#searchResults").on("click", ".addBtn", function() {
    var addUrl = $(this).attr('id');
    addUrl += "&ownerId=" + profId;
    ajaxFunctions.ajaxRequest('POST', addUrl, addBook);
  });

  // jquery request book function
  $("#allBooks").on("click", ".requestBtn", function() {
    var requestUrl = $(this).attr('id');
    ajaxFunctions.ajaxRequest('POST', requestUrl, requestBook);
  });

  //jquery remove books from collection function 

  $("#profileBooks").on("click", ".removeBtn", function() {
    var removeUrl = '/delete/api/'
    removeUrl += $(this).attr('id');
    ajaxFunctions.ajaxRequest('DELETE', removeUrl, function() {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/profile/api/" + profId, getBooks);
    });
  });

  // jquery remove books from collection from main book page
  $("#allBooks").on("click", ".removeBtn", function() {
    var removeUrl = '/delete/api/'
    removeUrl += $(this).attr('id');
    ajaxFunctions.ajaxRequest('DELETE', removeUrl, function() {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/books/api/", getAllBooks);
    });
  });

  //function to return all personal books on profile page
  function getBooks(data) {
    var response = JSON.parse(data);
    var output = "<div class='row'>";
    if ('error' in response) {
      output = "<div class='alert alert-danger'>You do not have any books in your collection. ";
      output += "<a href='/search'>Search</a> for books to add!</div>";
    } else {
      output += "<h3>My Books</h3>";
      for (var i = 0; i < response.length; i++) {
        var cover;
        var title;
        var bookId = response[i].bookId;
        output += "<div class='col-sm-4 col-md-3 bookItem text-center'>";

        if (response[i].cover) {
          cover = response[i].cover;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = response[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";
        if (response[i].ownerId === profId && (response[i].requestorId === "" || response[i].approvalStatus === "N")) {
          output += '<div class="btn removeBtn ' + bookId + '" id="' + bookId + '" ><p>Remove Book</p></div>';

        } else if (response[i].ownerId === profId && response[i].approvalStatus === "Y") {
          output += '<div class="btn approvedButton ' + bookId + '"><p>Request Approved</p></div>';

        } else if (response[i].ownerId === profId && response[i].requestorId !== "") {
          output += '<div class="btn approveBtn ' + bookId + '" id="' + bookId + '-approve" ><p>Approve Request</p></div>';
          output += '<div class="btn denyBtn ' + bookId + '" id="' + bookId + '-deny" ><p>Deny Request</p></div>';

        }
        output += "</div>";
      }

    }
    output += "</div>";
    profileBooks.innerHTML = output;
  }
  // function to get denied requests 
  function getDenied(data) {

    var response = JSON.parse(data);
    var output = "<div class='row'>";
    if ('error' in response) {
      //output = "<div class='alert alert-danger'>You do not have any books in your collection. "
      //output += "<a href='/search'>Search</a> for books to add!</div>";
    } else {
      output += "<h3>Denied Requests</h3>"
      output += "<div class='alert alert-danger'>click on 'request denied' button to clear request from your account</div>";

      for (var i = 0; i < response.length; i++) {
        var cover;
        var title;
        var bookId = response[i].bookId;
        output += "<div class='col-sm-4 col-md-3 bookItem text-center'>";

        if (response[i].cover) {
          cover = response[i].cover;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = response[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";
        if (response[i].requestorId === profId && response[i].approvalStatus === "N") {
          var requestUrl = appUrl + "/request/api/?bookId=" + bookId + "&requestorId=" + profId;
          output += '<div class="btn requestedButton ' + bookId + '" id="' + requestUrl + '" ><p>Request Denied</p></div>';
        }
        output += "</div>";
      }

    }
    output += "</div>";

    deniedRequestedBooks.innerHTML = output;

  }

  // function to get requested books 
  function getRequests(data) {
    var response = JSON.parse(data);
    var output = "<div class='row'>";
    if ('error' in response) {
      //  output = "<div class='alert alert-danger'>You do not have any books in your collection. "
      //  output += "<a href='/search'>Search</a> for books to add!</div>";
    } else {
      output += "<h3>Requested Books (awaiting response)</h3>"
      for (var i = 0; i < response.length; i++) {
        var cover;
        var title;
        var bookId = response[i].bookId;
        output += "<div class='col-sm-4 col-md-3 bookItem text-center'>";

        if (response[i].cover) {
          cover = response[i].cover;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = response[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";

        if (response[i].requestorId === profId && response[i].approvalStatus === "") {
          var requestUrl = appUrl + "/request/api/?bookId=" + bookId + "&requestorId=" + profId;
          output += '<div class="btn requestedButton ' + bookId + '" id="' + requestUrl + '" ><p>Cancel Request</p></div>';

        }
        output += "</div>";
      }

    }
    output += "</div>";

    requestedBooks.innerHTML = output;

  }

  // function to get approved requests
  function getApproved(data) {

    var response = JSON.parse(data);
    var output = "<div class='row'>";
    if ('error' in response) {
      //output = "<div class='alert alert-danger'>You do not have any books in your collection. "
      //output += "<a href='/search'>Search</a> for books to add!</div>";
    } else {
      output += "<h3>Approved Requests</h3>"


      for (var i = 0; i < response.length; i++) {
        var cover;
        var title;
        var bookId = response[i].bookId;
        output += "<div class='col-sm-4 col-md-3 bookItem text-center'>";

        if (response[i].cover) {
          cover = response[i].cover;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = response[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";
        if (response[i].requestorId === profId && response[i].approvalStatus === "Y") {
          output += '<div class="btn approvedButton ' + bookId + '"><p>Request Approved</p></div>';
        }
        output += "</div>";
      }

    }
    output += "</div>";

    approvedRequestedBooks.innerHTML = output;

  }
  /*
      book controller below
  */
  var searchResults = document.querySelector('#searchResults');
  var allBooks = document.querySelector('#allBooks');

  //return search results
  function getSearchResults(data) {
    var searchObject = JSON.parse(data);
    var output;
    if ('error' in searchObject) {
      output = "<div class='alert alert-danger'>Your search did not return any results. Please try again</div>";
    } else {
      output = "<ul class='list-group'>";
      for (var i = 0; i < searchObject.length; i++) {
        var cover;
        var title;
        var bookId = searchObject[i].id;
        output += "<li class='list-group-item'>";
        if (searchObject[i].thumbnail) {
          cover = searchObject[i].thumbnail;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = searchObject[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";

        if (searchObject[i].description) {
          output += "<p class='bookDescription'>" + searchObject[i].description + "</p><br />";
        } else {
          output += "<p class='bookDescription'>No Description Available</p><br />";
        }
        var requestUrl = appUrl + "/add/api/?title=" + title + "&cover=" + cover + "&bookId=" + bookId;
        output += '<div class="btn addBtn ' + bookId + '" id="' + requestUrl + '" ><p>Add Book</p></div>';
        output += "</li>";

      }
      output += "</ul>";

    }

    searchResults.innerHTML = output;
  }

  //function to get all books
  function getAllBooks(data) {
    var bookObject = JSON.parse(data);
    var output = "<div class='row'>";
    if ('error' in bookObject) {
      output = "<div class='alert alert-danger'>Your search did not return any results. Please try again</div>";
    } else {
      for (var i = 0; i < bookObject.length; i++) {
        var cover;
        var title;
        var bookId = bookObject[i].bookId;
        output += "<div class='col-sm-4 col-md-3 bookItem text-center'>";
        if (bookObject[i].cover) {
          cover = bookObject[i].cover;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = bookObject[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";
        if (bookObject[i].ownerId === profId && (bookObject[i].requestorId === "" || bookObject[i].approvalStatus === "N")) {
          output += '<div class="btn removeBtn ' + bookId + '" id="' + bookId + '" ><p>Remove Book</p></div>';

        } else if ((bookObject[i].requestorId === profId || bookObject[i].ownerId === profId) && bookObject[i].approvalStatus === "Y") {
          output += '<div class="btn approvedButton ' + bookId + '"><p>Request Approved</p></div>';
        } else if (bookObject[i].requestorId === profId && bookObject[i].approvalStatus === "N") {
          var requestUrl = appUrl + "/request/api/?bookId=" + bookId + "&requestorId=" + profId;
          output += '<div class="btn requestedButton ' + bookId + '" id="' + requestUrl + '" ><p>Request Denied</p></div>';
        } else if (bookObject[i].requestorId === profId && bookObject[i].approvalStatus === "") {
          var requestUrl = appUrl + "/request/api/?bookId=" + bookId + "&requestorId=" + profId;
          output += '<div class="btn requestedButton ' + bookId + '" id="' + requestUrl + '" ><p>Cancel Request</p></div>';

        } else if (bookObject[i].ownerId === profId && bookObject[i].requestorId !== "" && bookObject[i].approvalStatus !== "N") {
          output += '<div class="btn approveBtn ' + bookId + '" id="' + bookId + '-approve" ><p>Approve Request</p></div>';
          output += '<div class="btn denyBtn ' + bookId + '" id="' + bookId + '-deny" ><p>Deny Request</p></div>';

        } else if (bookObject[i].requestorId.length > 0 && bookObject[i].requestorId !== profId) {
          output += '<div class="btn requestBtn"><p>Outstanding Request</p></div>';
        } else {

          var requestUrl = appUrl + "/request/api/?bookId=" + bookId + "&requestorId=" + profId;;
          output += '<div class="btn requestBtn ' + bookId + '" id="' + requestUrl + '" ><p>Request Book</p></div>';
        }

        output += "</div>";
      }
    }
    output += "</div>";
    allBooks.innerHTML = output;
  }

  // allbooks function called only on /books page
  $(document).ready(function() {
    if (window.location.pathname === "/books") {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/books/api/", getAllBooks);
    }
  });

  //jquery to cancel request 
  $("#allBooks").on("click", ".requestedButton", function() {
    var requestUrl = $(this).attr('id');
    ajaxFunctions.ajaxRequest('DELETE', requestUrl, cancelRequest);
  });

  // jquery profile page cancel request 
  $("#deniedRequests").on("click", ".requestedButton", function() {
    var requestUrl = $(this).attr('id');
    ajaxFunctions.ajaxRequest('DELETE', requestUrl, cancelRequest);
  });

  // main cancel request function
  function cancelRequest(data) {
    var response = JSON.parse(data);
    if (response.hasOwnProperty('error')) {
      alert(response.error);
      return;
    } else if (window.location.pathname === "/profile") {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/request/api/" + profId, getRequests);
      ajaxFunctions.ajaxRequest('GET', appUrl + "/deniedrequests/api/" + profId, getDenied);
    } else {
      var addClass = "." + response.bookId;
      $("#allBooks").find(addClass).removeClass("requestedButton").addClass("requestBtn").html("<p>Request Book</p>");
    }
  }
  // main deny request function
  function denyRequest(data) {
    var response = JSON.parse(data);
    if (response.hasOwnProperty('error')) {
      alert(response.error);
      return;
    } else if (window.location.pathname === "/profile") {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/profile/api/" + profId, getBooks);
    } else {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/books/api/", getAllBooks);

    }
  }

  // main accept request function
  function acceptRequest(data) {
    var response = JSON.parse(data);
    if (response.hasOwnProperty('error')) {
      alert(response.error);
      return;
    } else if (window.location.pathname === "/profile") {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/profile/api/" + profId, getBooks);
    } else {
      ajaxFunctions.ajaxRequest('GET', appUrl + "/books/api/", getAllBooks);
    }
  }

  //jquery accpet request function
  $("#allBooks").on("click", ".approveBtn", function() {
    var requestUrl = $(this).attr('id');
    requestUrl = requestUrl.substr(0, requestUrl.length - 8);
    requestUrl = 'approve/api/' + requestUrl;
    ajaxFunctions.ajaxRequest('POST', requestUrl, acceptRequest);
  });

  //jquery accept request function
  $("#profileBooks").on("click", ".approveBtn", function() {
    var requestUrl = $(this).attr('id');
    requestUrl = requestUrl.substr(0, requestUrl.length - 8);
    requestUrl = 'approve/api/' + requestUrl;
    ajaxFunctions.ajaxRequest('POST', requestUrl, acceptRequest);
  });

  //jquery deny request function
  $("#allBooks").on("click", ".denyBtn", function() {
    var requestUrl = $(this).attr('id');
    requestUrl = requestUrl.substr(0, requestUrl.length - 5);
    requestUrl = 'deny/api/' + requestUrl;
    ajaxFunctions.ajaxRequest('DELETE', requestUrl, denyRequest);
  });

  // jquery profile page deny request
  $("#profileBooks").on("click", ".denyBtn", function() {
    var requestUrl = $(this).attr('id');
    requestUrl = requestUrl.substr(0, requestUrl.length - 5);
    requestUrl = 'deny/api/' + requestUrl;
    ajaxFunctions.ajaxRequest('DELETE', requestUrl, denyRequest);
  });

  //get search results
  $("#searchForm").bind('submit', function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    var bookTitle = $("#searchInput").val();
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + "/search/api/?title=" + bookTitle, getSearchResults));
    $("#searchInput").val('');
    return false;
  });

})();