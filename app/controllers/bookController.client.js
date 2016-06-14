'use strict';

(function() {

    var searchResults = document.querySelector('#searchResults');
    //return search results
    function getSearchResults(data) {
        var searchObject = JSON.parse(data);
        var output;
        console.log(searchObject);
        if ('error' in searchObject) {
            output = "<div class='alert alert-danger'>Your search did not return any results. Please try again</div>";
        } else {
            output = "<ul class='list-group'>";
            for (var i = 0; i < searchObject.length; i++) {
                output += "<li class='list-group-item'>";
                if (searchObject[i].thumbnail) {
                    output += '<img src="' + searchObject[i].thumbnail + '" class="img-rounded img-book" alt="...">';
                } else output += '<img src=/public/img/noCover.png class="img-rounded img-book" alt="...">';
                output += "<h3 class='bookTitle'>" + searchObject[i].title + "</h3><br />";
                if (searchObject[i].description) {
                    output += "<p class='bookDescription'>" + searchObject[i].description + "</p><br />";
                } else {
                    output += "<p class='bookDescription'>No Description Available</p><br />";
                }
                output += "</li>";
            }
            output += "</ul>";

        }

        output += "</ul>";
        searchResults.innerHTML = output;
    }

    //get search results
    $("form").bind('submit', function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var bookTitle = $("#searchInput").val();

        ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + "/testing/?title=" + bookTitle, getSearchResults));
        $("#searchInput").val('');

        return false;
    });


})();