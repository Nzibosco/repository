//Used for building urls for api calls
var apiKey = "?key=";
var userLocation = "&location=";
var urlMethod = "";
var queryUrl = "https://api.petfinder.com/";
var zipCode = "";
var shelterIdTag = "&id="
var shelterId = "";
var status = "&status=A&format=json&count=15"
var animal = "";
var tempStorage = '';

//Use for only-one-open functions
var currentActive = "li0";
var selectedPet = "pic0";

//Get and store api keys
var database = firebase.database();
database.ref().on("value",function(childSnapshot){
	apiKey += childSnapshot.val().petfinderApi;
	tempStorage = childSnapshot.val().googleMapsApi;
});

//Prevent reload on enterKey down
$("#zip_code").on("keydown", function(event) {
	// User can only press enter when 5 character exist in the input
	// Allow for backspace to be pressed

	if($(this).val().length >= 5 && event.keyCode !== 8) {
		event.preventDefault();
	}

  if (event.keyCode === 13) {
		event.preventDefault();
	}
  
});

//Handle zip content (enter key)
$("#zip_code").on("keyup", function(event) {
	var tempZip = $(this).val();
	// Checks again that the zipcode is 5 character
  if (event.keyCode === 13 && tempZip.length === 5) {
		$("#shelterDetails").empty();
		$("#shelterResults").empty().text("Please wait while the shelters near [ zipcode = "+ tempZip +" ] load...");;
		urlMethod = "shelter.find";
		zipCode = tempZip;
		$("#ad-card").empty();
		$(this).val("");
		
		genericApiCall();
		$("#setMargin").css("margin-left","250px");//ADD ME TO CODE
  }
});

//Handle zip content (submit button)
$("#btn-search").on("click", function(event) {
	var tempZip = $("#zip_code").val();
	// Checks again that the zipcode is 5 character
	if(tempZip.length===5){
		$("#shelterDetails").empty();
		$("#shelterResults").empty().text("Please wait while the shelters near [ zipcode = "+ tempZip +" ] load...");
		urlMethod = "shelter.find";
		zipCode = tempZip;
		$("#ad-card").empty();
		$("#zip_code").val("");
		
		genericApiCall();
		$("#setMargin").css("margin-left","250px");//ADD ME TO CODE
	}
});

// Function that allows only 1 or 0 pet profiles to be toggled open
function onlyOnePetPic(event){
	var clickedPet = $(event.target).attr("id");
	var descDiv = $("."+clickedPet);
	var iconId = clickedPet.substring(3);

	if(clickedPet === selectedPet){
		descDiv.css("display","none");
		$("#"+clickedPet).css("background-color","#dddddd");
		$("#"+clickedPet).css("width","150px");
		$("#"+clickedPet).css("height","150px");
		
		var iconHolder = $($("#"+iconId).children()[0]);
		var tempClass = iconHolder.attr("class");
		iconHolder.removeClass(tempClass);
		iconHolder.addClass("fa fa-ellipsis-v");
		iconHolder.css("color","#dddddd");

		selectedPet = "";
		return;
	}
	if(clickedPet !== selectedPet){
		descDiv.css("display","inline-block");
		$("#"+clickedPet).css("background-color","#009900");
		$("#"+clickedPet).css("width","200px");
		$("#"+clickedPet).css("height","200px");

		var iconHolder = $($("#"+iconId).children()[0]);
		var tempClass = iconHolder.attr("class");
		iconHolder.removeClass(tempClass);
		iconHolder.addClass("fa fa-ellipsis-h");
		iconHolder.css("color","#009900");

		if(selectedPet!=="")
			$("#"+selectedPet).click();
		selectedPet = clickedPet;
	}
}

// Generates google map location and button to show pets for shelter
var shelterTitleHolder;
function moreBtn(event){
	var tempLatitude = parseFloat(event.path[2].children[8].innerText);
	var tempLongitude = parseFloat(event.path[2].children[9].innerText);

	urlMethod = "shelter.getPets"
	shelterId = $(event.path[5]).attr("id");
	
	var tempTitle = $($(event.path[4]).children()[0]).text();
	shelterTitleHolder = tempTitle;
	
	$("#shelterDetails").empty();
	$("#shelterDetails").append(

		"<div class='row' style='margin-bottom: 0;'>" +
			"<ul style='margin: 0; width: 100%'>" +
				"<li >" +
					"<div class='collapsible-header' style='background-color: #009900; color: white;'>More Details</div>"+
					"<div style='height:200px;'>" +
						"<div id='map' style='height: 100%;'>"+
						// Map placed here by initMap()
						"</div>" +
					"</div>" +
					"<script>" +
					"var map;" +
					"function initMap() {" +
						"map = new google.maps.Map(document.getElementById('map'), {" +
							"center: {lat: "+tempLatitude+", lng: "+tempLongitude+"}," +
							"zoom: 8" +
						"});" + 
					"}" +
					"</script>" +
					"<script src='https://maps.googleapis.com/maps/api/js?key="+ tempStorage +"&callback=initMap'"+
						"async defer></script>" +
					"<div class='body' style='border-bottom: 1px solid #ddd; padding: 2rem;'><span>"+
						"<h5 style='display:block;margin:auto;'>"+ tempTitle +"</h5>" + 
						"<div class='center-align'><br>" +
						"<button id ='skipQuestions' onclick='genericApiCall()' class='btn waves-effect waves-light' style='background-color: #009900'>Show Available Pets</button></div>" +
						"</span></div>" +
				"</li>" +
			"</ul>" +
		"</div>");
}

function genericApiCall(){

	switch (urlMethod){

		case 'shelter.find':
			//$("#shelterResult").html("Please wait while shelters close by are loaded");
			var tempUrl = queryUrl + urlMethod + apiKey + userLocation + zipCode +"&format=json&count=10";
			var proxyURL = "";//"https://cors-anywhere.herokuapp.com/";
			var settings = {
				"async": true,
				"crossDomain": true,
				"url": proxyURL+tempUrl,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
				},
				"data": {
				}
			}
			$.ajax(settings).done(function (response) {
				if(response.petfinder.shelters === undefined){
					$("#shelterResults").text("No shelters found for zip code: " + zipCode);
					return;
				}
				$("#shelterResults").html("");
				currentActive = "li0";

				$.each(response.petfinder.shelters.shelter, function(i){
					var _latitude = response.petfinder.shelters.shelter[i].latitude.$t;
					var _longitude = response.petfinder.shelters.shelter[i].longitude.$t;
					var _phone = response.petfinder.shelters.shelter[i].phone.$t;
					if(_phone===undefined) _phone = "N/A";
					var _email = response.petfinder.shelters.shelter[i].email.$t;
					if(_email===undefined) _phone = "N/A";
					var _name = response.petfinder.shelters.shelter[i].name.$t;
					if(_name===undefined) _phone = "N/A";
					var _city = response.petfinder.shelters.shelter[i].city.$t;
					if(_city===undefined) _phone = "N/A";
					var _state = response.petfinder.shelters.shelter[i].state.$t;
					if(_state===undefined) _phone = "N/A";
					var _zip = response.petfinder.shelters.shelter[i].zip.$t;
					if(_zip===undefined) _phone = "N/A";
					var _id = response.petfinder.shelters.shelter[i].id.$t;
					var tempClass = "";
					var alignment = "h";
					if(i===0) {
						alignment = "v";
						tempClass = "class='active'";
					}
					$("#shelterResults").append(
						"<div class='row rowCell' style='margin-bottom: 0;' id='cell" + i + "'>" +
							"<ul class='collapsible style' style='margin: 0;' id= '" + _id + "'>" +
								"<li id='li" + i + "'" + tempClass + ">" +
									"<div class='collapsible-header' style='background-color: #009900; color: white;' onClick='onlyOneOpen(this)'>"+
									"<i class='fa fa-ellipsis-"+ alignment +"'></i>"+_name+
									"</div>"+
									"<div class='collapsible-body'><span>"+
										"<b>Name: </b>" + _name + "<br>" +
										"<b>Phone number: </b>" + _phone + "<br>" +
										"<b>Email: </b>" + _email + "<br>" + 
										"<b>Location: </b>" + _city + ", " + _state + " " + _zip + "<br>"+
										"<p id='latitude' style='display:none'>" + _latitude + "</p>" +
										"<p id='latitude' style='display:none'>" + _longitude + "</p>" +
										"<div class='button' id='btn-more' style='padding-bottom: 26px'>" +
										"<button id='more-btn' onclick='moreBtn(event)' class='right btn waves-effect waves-light' style='background-color: #009900'> See more </button>" +
										"</div>" +
										"</span></div>" +
								"</li>" +
							"</ul>" +
						"</div>"
					);
					$('.collapsible').collapsible();
				});
				
				}).fail( function(xhr, textStatus, errorThrown) {
					console.log("Something bad happened");
			});
			
			break;

			
		case 'shelter.getPets':
			$(".body").text("Please wait while the good bois and gals are loaded");
			var tempUrl = queryUrl + urlMethod + apiKey + shelterIdTag + shelterId + status;
			var proxyURL = "";//"https://cors-anywhere.herokuapp.com/";
			var settings = {
				"async": true,
				"crossDomain": true,
				"url": proxyURL+tempUrl,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
				},
				"data": {
				}
			}
			$.ajax(settings).done(function (response) {
				$(".body").empty("");
				$(".body").append("<h5 style='display:block; margin:auto;'>" + shelterTitleHolder + "</h5>");
				$(".body").append("<br>");
				$(".body").append("<hr>");
				if(response.petfinder.pets.pet === undefined){
					$(".body").append("This shelter has no documented pets.");
					return;
				}
				for(var i = 0; i < response.petfinder.pets.pet.length; i ++){
					var desc = response.petfinder.pets.pet[i].description.$t;
					var tempId = response.petfinder.pets.pet[i].id.$t;
					
					var tempPhoto = response.petfinder.pets.pet[i].media.photos.photo[2].$t;
					var _name = response.petfinder.pets.pet[i].name.$t;
					var _age = response.petfinder.pets.pet[i].age.$t;
					var _animal = response.petfinder.pets.pet[i].animal.$t;
					var _sex = response.petfinder.pets.pet[i].sex.$t;
					var _size = response.petfinder.pets.pet[i].size.$t;
					
					var tempZero = "style='display: inline-block'";
					var tempBg = "'background: #009900;"
					var tempH = "200px;";
					var tempW = "200px;";
					var alignment = "v";
					var tempIconColor = "#dddddd";
					if(i===0) {
						selectedPet="pic"+tempId;
						alignment = "h";
						tempIconColor = "#009900"
					}
					if (i !== 0) {
						tempH = "150px;";
						tempW = "150px;";
						tempZero = "style='display: none'";
						tempBg = "'background: #dddddd;"
					}

					if(desc===undefined){
						desc ="Although our dear shelter pet hasn't been given the luxury of a description, we can tell you this pet deserves to be loved just as much as any other pet.";
					}
					
					
					$(".body").append(
						"<div id='"+ tempId +"'>" +
						"<i onclick='iconClick(event)' style='width:40px; font-size:2rem; color: "+ tempIconColor +"' id='"+ tempId +"' name='pic"+ tempId +"'class='fa fa-ellipsis-"+ alignment +"'></i>"+
						"<img " +
							"onclick = 'onlyOnePetPic(event)'" + 
							"id='pic" + tempId + "'" +
							"style = " + tempBg+
							"width: "+ tempW +
							"height: "+ tempH +
							"border-radius:50%;"+
							"display:block;"+
							"padding:2px;"+
							"margin: auto;"+
							"margin-top: 20px;' "+
							"src='" + tempPhoto +
						"'><br><h4 class='center'><b>"+ _name +"</b></h4><br>" +
						
						//"<hr>"+
						"<div " + tempZero + " class='pic"+ tempId +"'>" +
						"<b>Age: </b>"+ _age +"<br>" +
						"<b>Animal: </b>"+ _animal +"<br>" +
						"<b>Gender: </b>"+ _sex +"<br>" +
						"<b>Size: </b>"+ _size +"<br>" +
						"<u><b>Description:</b></u><br>" + desc +
						"</div></div><hr>"				
					);
				}
			});

			//console.log(tempUrl);
			break;
		default:
			console.log("Invalid url request");

	}
}

// Function that allows only 1 or 0 Shelter tabs to be toggled open
function onlyOneOpen(e){
	var tempId = $(e).parent().attr("id");
	var tempClass = $(e).parent().attr("class");


	var tempIcon = $($(e).parent(".div").prevObject[0].children[0]);
	var tempIconClass = tempIcon.attr("class");
	
	if (tempIconClass === "fa fa-ellipsis-v"){
		tempIcon.removeClass(tempIconClass);
		tempIcon.addClass("fa fa-ellipsis-h");
	} else {
		tempIcon.removeClass(tempIconClass);
		tempIcon.addClass("fa fa-ellipsis-v");
	}
	//="fa fa-ellipsis-h");
	// Controls when clicked element is set to active
	if(tempId !== currentActive && currentActive !== "" && tempClass !== "active"){

		// Controls when previous open element is closed
		if($("#" + currentActive).attr("class")==="active")
			$("#" + currentActive).children().click();
		//console.log("I'm active");
		currentActive = tempId;
		return;
	}
};

function iconClick(event){
	// Finds image in the div and clicks it
	$("img#" + $(event.target).attr("name")).click();
}

// document ready function
$(document).ready(function(){
	// Took over the background-color css for this button
	$("#btn-search").css("background-color","#009900");
});

// dropdown jquery (not used currently)
$(".dropdown-trigger").dropdown();