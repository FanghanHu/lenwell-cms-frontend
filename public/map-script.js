window.onload = () => {
    //initialize map
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 29.718557455282742, lng: -95.51367567423155},
        zoom: 15,
      });
    const infoWindow = new google.maps.InfoWindow({
        map: map,
      });
    const placeService = new google.maps.places.PlacesService(map);

    window.saveLocation = () => {
        let location = {...(infoWindow._location)};
        location.name = $("#loc-name").val();
        location.address = $("#loc-address").val();
        location.phone_number = $("#loc-phone").val();
        location.partnered = $("#loc-partnered").prop('checked');
        //TODO: update sales

        if(location.id) {
            //update an existing location
            for(const key in location) {
                if(location[key] === null) {
                    location[key] = undefined;
                } 
            }
            $.ajax({
                url: `${window.BACKEND_URL}/locations/${location.id}`,
                data: location,
                type: "PUT",
                success: (res) => {
                    infoWindow._location.name = res.name;
                    infoWindow._location.address = res.address;
                    infoWindow._location.phone_number = res.phone_number;
                    infoWindow._location.partnered = res.partnered;
                }
            });
        } else {
            //creating a new location
            $.post(`${window.BACKEND_URL}/locations`,
                location, 
            (res) => {
                let newLoc = res;
                addLocatiionMarker(newLoc);
            })
        }

        infoWindow.close();
    }
    


    //change InfoWindow content and move it.
    const updateInfoWindow = (location) => {
        // console.log("updating to new location:", location);
        //attach latest location with the infoWindow so buttons can access it.
        infoWindow._location = location;
        infoWindow.setContent(
            `
                <div>
                    <div class="form-group">
                        <label for="loc-name">Name:</label>
                        <input type="text" class="form-control" id="loc-name" value="${location.name}"></input>
                    </div>
                    <div class="form-group">
                        <label for="loc-address">Address:</label>
                        <input type="text" class="form-control" id="loc-address" value="${location.address}"></input>
                    </div>
                    <div class="form-group">
                        <label for="loc-phone">Phone Number:</label>
                        <input type="text" class="form-control" id="loc-phone" value="${location.phone_number}"></input>
                    </div>
                    <div class="row m-0 my-2">
                        <div class="col">
                            <div class="font-weight-bold">
                                Sales: ${location?.sale?.name??"Not Assigned"}
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="loc-partnered" ${location.partnered==true?"checked":""}>
                                <label class="form-check-label font-weight-bold" style="vertical-align:sub;" for="loc-partnered">Partnered</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-end my-2">
                    <button class="btn btn-success mx-1" onclick="saveLocation()">Save</button>
                    ${location.id!==undefined?'<button class="btn btn-danger mx-1">Delete</button>':""}
                    </div>
                </div>
            `
        );
        infoWindow.setPosition({
            lat: location.lat,
            lng: location.lng
          });
        infoWindow.open(map);
    }

    //add a marker to the map
    const addLocatiionMarker = (location) => {
        const locatioinMarker = new google.maps.Marker({
          position: {
            lat: location.lat,
            lng: location.lng
          },
          map:map,
          icon: {
            url: location.partnered ? "/assets/icon/green-marker.svg" : "/assets/icon/gray-marker.svg",
            scaledSize: new google.maps.Size(50, 50)
          },
        });
        
        locatioinMarker.location = location;
  
        //when an existing location gets clicked
        google.maps.event.addDomListener(locatioinMarker, "click", function() {
            updateInfoWindow(location);
        });
    }

    //when the map is clicked
    map.addListener("click", (event) => {
        if(event.placeId) {
          //clicking a POI, stop default fetching  of location detail.
          event.stop();

          //get place detail from google
          placeService.getDetails({
            placeId: event.placeId,
          }, ({formatted_address, formatted_phone_number, name}) => {
            //once the place's information is gathered, output it on the infoWindow as default info
            updateInfoWindow({
                lng: event.latLng.lng(),
                lat: event.latLng.lat(),
                name: name,
                address: formatted_address,
                phone_number: formatted_phone_number,
                partnered: false,
            });
          })
        } else {
          //clicking on an empty location
          //TODO: reverse geocode to get the street address
          updateInfoWindow({
            lng: event.latLng.lng(),
            lat: event.latLng.lat(),
            name: "",
            address: "",
            phone_number: "",
            partnered: false,
        });
        }
    });

    //load locations from server
    $.get(`${window.BACKEND_URL}/locations`).then((data) => {
        for(const location of data) {
          addLocatiionMarker(location);
        }
      })
}