//Check for browser compatibility
var browser = (function (agent) {switch (true) {
    case agent.indexOf("edg/") > -1: return "supported";
    case agent.indexOf("firefox") > -1: return "supported";
    case agent.indexOf("edge") > -1: return "supported";
    case agent.indexOf("safari") > -1: return "supported";     
    case agent.indexOf("opr") > -1 && !!window.opr: return "supported";
    case agent.indexOf("chrome") > -1 && !!window.chrome: return "supported";
    default: return "unsupported";
  }
})(window.navigator.userAgent.toLowerCase());

if(browser == "unsupported") {
  window.location = "/exceptions/browser.html";
}

//map init
var map = L.map('map', {tap: false}).setView([37.7749, -122.4194], 12);
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles'
}).addTo(map);

var sfRestrauntData;
var markerList = [];

//convert a string to title case
function toTitleCase(value) {
  value = value.toLowerCase().split(' ');
  for (var i = 0; i < value.length; i++) {
    value[i] = value[i].charAt(0).toUpperCase() + value[i].slice(1); 
  }
  return value.join(' ');
}

//getting data from webserver hosted on: https://sfheathcodeserver.asmallyawn.repl.co/
function pullData() {
  console.log("Fetching data...");
  $.ajax({
    url: "https://HeathCodeServer-MadeWithReplitHackation.asmallyawn.repl.co/sf",
      type: "GET",
    
  }).done(function(data) {
    var businessData = JSON.parse(data);
    sfRestrauntData = businessData;

    //changed the api to sort by name
    //adding markers to map
    for (var i = 0; i < businessData.length; i++) {
      var item = businessData[i];
      if(item.hasOwnProperty('business_latitude')){
        var marker = L.marker([item.business_latitude, item.business_longitude], {
          title: item.business_name
        }).addTo(map);

        var year = item.inspection_date.split('-')[0]

        if(item.inspection_score === undefined) {
          item.inspection_score = "No Score Available"
        }

        if(item.risk_category === undefined) {
          item.risk_category = "No Rating Available"
        }

        if(item.violation_description === undefined) {
          item.violation_description = "No Description Available"
        }

        
        var popupHTML = (`
          <body>
            <h1>${toTitleCase(item.business_name)}</h1>
            <b>Address:</b> ${toTitleCase(item.business_address)}<br>
            <b>Inspection Year</b>:  ${year}<br>
            <b>Inspection Score</b>: ${item.inspection_score}<br>
            <b>Violation Risk</b>:  ${item.risk_category}<br>
            <b>Violation Type</b>:  ${item.violation_description}<br>
          </body>
          `);
        marker.bindPopup(popupHTML);
        markerList.push(marker);
      }
    }
  });


}

pullData(); 


function findMarker(name) {
  for(var i = 0; i < markerList.length; i++) {
    var item = markerList[i]
    var markerName = item.options.title;

    if(markerName == name) {
      item.openPopup();

    }
  }
  
}

//HEAILY optimized
function search() {
  var results = false;
  var table = document.getElementById("searchTable");
  var tbody = document.getElementById("searchTableBody");
  var searchData = document.getElementById("searchInput").value;

  var arr = []
  for (var i = 0; i < sfRestrauntData.length; i++) {
      var item = sfRestrauntData[i];
      var name = item.business_name.toLowerCase();
      var searchTerm = searchData.toLowerCase();

      if (name.includes(searchTerm) && item.hasOwnProperty('business_latitude') && item.hasOwnProperty('business_longitude')) {
        arr.push(item.business_name);
        results = true;
      }

  }

  document.getElementById('searchTableBody').innerHTML = '';
  
  for(var i = 0; i < arr.length; i++) {
    
    var searchResult = arr[i];
    var btn = document.createElement("button");
    btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
    btn.className = "openMarkerButton";
    btn.type = "button";
    btn.name = arr[i];    
    btn.onclick = function(){findMarker(this.name)};  
   
    var row = tbody.insertRow();
    var nameCell = row.insertCell();
    var markerCell = row.insertCell();
    var result = document.createTextNode(toTitleCase(searchResult));
    nameCell.appendChild(result);
    markerCell.appendChild(btn);

  }

  if(results == false) {
    var row = tbody.insertRow();
    var nameCell = row.insertCell();
    nameCell.className = "noResultsText"
    nameCell.appendChild(document.createTextNode("Restaurant either currently passes health inspection or hasnt gone through one yet"))
  }

}

var input = document.getElementById("searchInput");

input.addEventListener("keyup", function(event) {
  
  if (event.keyCode === 13) {
    document.getElementById("searchButton").click();
  }
}); 

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  window.location = "/exceptions/mobile.html";
}