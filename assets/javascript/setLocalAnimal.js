// Parse the URL parameter
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Give the parameter a variable name
var dynamicContent = getParameterByName('animal');
var queryUrl = "https://api.petfinder.com/";
var key= "?key=";
var animal = "";
var breed = "";
var size = "";
var sex = "";
var loc = "";
var age = "";
//var offset = "";
var urlEnding = "&count=15&output=full&format=json";

var database = firebase.database();

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

function iconClick(event){
	// Finds image in the div and clicks it
	$("img#" + $(event.target).attr("name")).click();
}

//console.log(dynamicContent);
if(dynamicContent==="Eminem"){
    $("#motto").text("Mom's spaghetti");
    //return;
}
else if(dynamicContent!=="Dog" &&
        dynamicContent!=="Cat" &&
        dynamicContent!=="Barnyard" &&
        dynamicContent!=="Bird" &&
        dynamicContent!=="Reptile" &&
        dynamicContent!=="Horse" &&
        dynamicContent!=="Smallfurry"){
    console.log("We're sorry, that animal does not exist in our search database.");
}
else {
    animal = "&animal=" +  dynamicContent.toLowerCase();
    $('select').formSelect();
    
    $("#motto").text(dynamicContent);

    // Add database key access here
    database.ref().on("value",function(childSnapshot){
        key += childSnapshot.val().petfinderApi;        
    });



    if(dynamicContent==="Other"){
        console.log("sah dood");
        animal="";
        $("#otherId").show();
        $("#breedId").hide();
    }

    //animal+=dynamicContent;

    /*Handle zip content (submit button)
    $("#btn-search").on("click", function(event) {
        var tempZip = $("#zip_code").val();
        
    });
    */
    $("#dropdown1").dropdown();
}

$("#submit-btn").on("click",function(e){
    var urlMethod = "pet.getRandom";

    var tempZipcode = $("#zip_code").val();
    if(tempZipcode!=="") loc = "&location=" + tempZipcode;

    var tempAge = $("#age").val();
    if(tempAge!==null) {
        if(tempZipcode.length!==5){
            console.log("requires zipcode");
            return;
        }
        age = "&age=" + tempAge;
        urlMethod = "pet.find";
    }

    var tempSize = $("#size").val();
    if(tempSize!==null) {
        tempSlice = tempSize.slice(0,1);
        if(tempSlice !== "X"){
            size = "&size=" + tempSlice;
        }
        else {
            size = "&size=" + "XL";
        }
    }

    var tempGender = $("#gender").val();
    if(tempGender!==null) sex = "&sex=" + tempGender;

    var tempBreed = $("#breed").val();
    if(tempBreed!==null) breed = "&breed=" + tempBreed;




    var tempUrlBuild = queryUrl + urlMethod + key+animal+breed+breed+size+loc+age+urlEnding;
    $(".with-header").hide();
    console.log(tempUrlBuild);
    
    // Load search onto page
    $(".container").append("<p class='center' id='containerStatus'>Please wait while the good bois and gals are loaded</p>");
    //var tempUrl = queryUrl + urlMethod + apiKey + shelterIdTag + shelterId + status;
    var proxyURL = "";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": proxyURL + tempUrlBuild,
        "method": "GET",
        "headers": {
            "cache-control": "no-cache",
        },
        "data": {
        },
    }
    $.ajax(settings).done(function (response) {
        
        //if(response.petfinder.pet===undefined);


        if(response.petfinder.pet.length === 0){
            $("#containerStatus").text("This shelter has no documented pets.");
            return;
        }
        for(var i = 0; i < response.petfinder.pet.length; i ++){
        var desc = response.petfinder.pet[i].description.$t;
        var tempId = response.petfinder.pet[i].id.$t;
        

        var tempPhoto;
        try {
        tempPhoto = response.petfinder.pet[i].media.photos.photo[2].$t;
        } catch(err){
            tempPhoto = "";
        }
        var _name = response.petfinder.pet[i].name.$t;
        var _age = response.petfinder.pet[i].age.$t;
        var _animal = response.petfinder.pet[i].animal.$t;
        var _sex = response.petfinder.pet[i].sex.$t;
        var _size = response.petfinder.pet[i].size.$t;
        var _breed = response.petfinder.pet[i].breeds.breed.$t
        
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
        $("#containerStatus").text("");
        $(".container").append(
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
                "'>"+
                "<br>"+
                "<h4 class='center'>"+
                    "<b>"+ _name +
                    "</b>"+
                "</h4>"+
                "<br>" +
            
            //"<hr>"+
                "<div " + tempZero + " class='pic"+ tempId +"'>" +
                    "<b>Age: </b>"+ _age +"<br>" +
                    "<b>Animal: </b>"+ _animal +"<br>" +
                    "<b>Gender: </b>"+ _sex +"<br>" +
                    "<b>Size: </b>"+ _size +"<br>" +
                    "<b>Breed: </b>"+ _breed +"<br>" +
                    "<u><b>Description:</b></u><br>" + desc +
                "</div>"+
            "</div><hr>"
            
        );
        }
    });
})