'use strict';

(function() {

    var searchResults = document.querySelector('#searchResults');
    var testing = document.querySelector('#testing');
    //return search results
    function getSearchResults(data) {
        var searchObject = JSON.parse(data);
        //testing.innerHTML = searchObject;
        var output;
        //console.log(searchObject);
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
                //output += '<a href="'+ requestUrl + '"><div class="btn add-btn"><p>Add Book</p></div></a>';
                output += '<div class="btn addBtn ' + bookId + '" id="' + requestUrl + '" ><p>Add Book</p></div>';
                output += "</li>";

            }
            output += "</ul>";

        }

        searchResults.innerHTML = output;
    }

    //function to get all books
    function getAllBooks(data) {
        console.log(data);
    }

   
$( document ).ready(function() {
    if (window.location.pathname === "/books") {
      console.log(appUrl + "/books/api/")
        ajaxFunctions.ajaxRequest('GET', appUrl + "/books/api/", getAllBooks);
    }
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