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
var map = L.map('map', {tap: false}).setView([41.8781, -87.6298], 12);
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles'
}).addTo(map);

var restrauntData;
var markerList = [];

//convert a string to title case
function toTitleCase(value) {
  value = value.toLowerCase().split(' ');
  for (var i = 0; i < value.length; i++) {
    value[i] = value[i].charAt(0).toUpperCase() + value[i].slice(1); 
  }
  return value.join(' ');
}

function pullData() {
  console.log("Fetching data...");
  $.ajax({
    url: "https://HeathCodeServer-MadeWithReplitHackation.asmallyawn.repl.co/ch",
      type: "GET",
    
  }).done(function(data) {
    var businessData = JSON.parse(data);
    restrauntData = businessData;

    //adding markers to map
    for (var i = 0; i < businessData.length; i++) {
      var item = businessData[i];

      if(item.hasOwnProperty('latitude')){
        var marker = L.marker([item.latitude, item.longitude], {
          title: item.dba_name
        }).addTo(map);

        var year = item.inspection_date.split('-')[0]
        var type;
        
        if(item.results === undefined) {
          item.results = "No Result Available"
        }

        if(item.risk === undefined) {
          item.risk = "No Rating Available"
        }

        if(item.violations === undefined) {
          type = "No Description Available"
        } else {
          var type = item.violations.split('- Comments:')[0]
        }

        
        var popupHTML = (`
          <body>
            <h1>${toTitleCase(item.dba_name)}</h1>
            <b>Address:</b> ${toTitleCase(item.address)}<br>
            <b>Inspection Year</b>:  ${year}<br>
            <b>Inspection Score</b>: ${item.results}<br>
            <b>Violation Risk</b>:  ${item.risk}<br>
            <b>Violation Type</b>:  ${type}<br>
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
  for (var i = 0; i < restrauntData.length; i++) {
      var item = restrauntData[i];
      var name = item.dba_name.toLowerCase();
      var searchTerm = searchData.toLowerCase();

      if (name.includes(searchTerm) && item.hasOwnProperty('latitude') && item.hasOwnProperty('longitude')) {
        arr.push(item.dba_name);
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

//run search function when enter is pressed
var input = document.getElementById("searchInput");

input.addEventListener("keyup", function(event) {
  
  if (event.keyCode === 13) {
    document.getElementById("searchButton").click();
  }
}); 

//redir on mobile
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  window.location = "/exceptions/mobile.html";
}