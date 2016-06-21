'use strict';

(function() {
    var profileId = document.querySelector('#profile-id') || null;
    var profileUsername = document.querySelector('#profile-username') || null;
    var profileRepos = document.querySelector('#profile-repos') || null;
    var displayName = document.querySelector('#display-name') || null;
    var shareButton = document.querySelector('#shareButton') || null;
    var profileBooks = document.querySelector('#profileBooks') || null;
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
        
        if (userObject.hasOwnProperty('error')) {
            document.querySelector("#loginButton").innerHTML = '<a href="/login">Login</a>';
            return;
        } else {
            document.querySelector("#loginButton").innerHTML = '<a href="/logout">Logout</a>'
            document.querySelector("#profileLink").innerHTML = '<a href="/profile">Profile</a>'
            document.querySelector("#searchLink").innerHTML = '<a href="/search">Search</a>'
            document.querySelector("#allBooksLink").innerHTML = '<a href="/books">All Books</a>'
            
            if(window.location.pathname === "/profile"){
                console.log(apiUrl + "/profile/api/" + profId);
                ajaxFunctions.ajaxRequest('GET', appUrl + "/profile/api/" + profId, getBooks);
            }

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
    
    
  // function to add books to personal collection    
  function addBook(data) {
    var response = JSON.parse(data);
    // if not logged in redirect to login page
    if (response.hasOwnProperty('error')) {
      alert(response.error);
      return;
    } else {
        var addClass = "." + response.bookId;
        $( "#searchResults" ).find( addClass ).removeClass("addBtn").addClass("addedButton").text("Added");
    console.log(response.bookId);
      }
  }

  // jquery add books to collection function
  $("#searchResults").on("click", ".addBtn", function() {
    var addUrl = $(this).attr('id');
    addUrl += "&ownerId=" + profId;
    console.log(addUrl);
    ajaxFunctions.ajaxRequest('POST', addUrl, addBook);
   // var rsvpUrl = appUrl + "/rsvp/" + barId;
   // ajaxFunctions.ajaxRequest('POST', rsvpUrl, getRsvp);
  });
  
  //jquery remove books from collection function 
    
  $("#profileBooks").on("click", ".removeBtn", function() {
    var removeUrl = '/delete/api/'
    removeUrl += $(this).attr('id');
    
    ajaxFunctions.ajaxRequest('DELETE', removeUrl, function() {

            ajaxFunctions.ajaxRequest('GET', appUrl + "/profile/api/" + profId, getBooks);
        });
   });
  
  //function to return all personal books
    function getBooks(data){
        var response = JSON.parse(data);
        console.log(response);
        var output;
    //console.log(response);
    if ('error' in response) {
      output = "<div class='alert alert-danger'>You do not have any books in your collection."
      output += "<a href'/search'>Search</a> for books to add!</div>";
    } else {
      output = "<ul class='list-group'>";
      for (var i = 0; i < response.length; i++) {
        var cover;
        var title;
        var bookId = response[i].bookId;
        output += "<li class='list-group-item'>";
        
        if (response[i].cover) {
          cover = response[i].cover;
          output += '<img src="' + cover + '" class="img-rounded img-book" alt="...">';
        } else {
          cover = '/public/img/noCover.png';
          output += '<img src="/public/img/noCover.png" class="img-rounded img-book" alt="...">';
        }
        title = response[i].title;
        output += "<h3 class='bookTitle'>" + title + "</h3><br />";
        
       // var requestUrl = appUrl + "/add/api/?title=" + title + "&cover=" + cover + "&bookId=" + bookId;
        //output += '<a href="'+ requestUrl + '"><div class="btn add-btn"><p>Add Book</p></div></a>';
        output += '<div class="btn removeBtn ' + bookId + '" id="'+ bookId+ '" ><p>Remove Book</p></div>';
        output += "</li>";

      }
      output += "</ul>";

    }

    profileBooks.innerHTML = output;
        
    }
    

})();