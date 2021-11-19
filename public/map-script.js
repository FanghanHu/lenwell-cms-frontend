
//user cache
const users = {};

async function addMessage(message, $chatContent) {
    const messageText = document.createElement("div");
    //query for sender name if the message doens't come with sender data
    let sender = undefined;

    if ((typeof message.sender) === "object" || message.sender === "undefined") {
        sender = message.sender;
    } else if (users[message.sender]) {
        sender = users[message.sender]
    } else {
        sender = await $.get(`${window.BACKEND_URL}/users/${message.sender}`);
        users[sender.id] = sender;
    }
    //parse chat markdown into html
    messageText.innerHTML = marked.parse(message.text);
    //make all images in message Text the same width
    const $messageText = $(messageText);
    $messageText.find("img").css("width", "100%");
    $messageText.find("img").css("border-radius", "5px");
    $messageText.addClass(`text-white rounded p-3`);
    if (user?.id === sender?.id) {
        $messageText.css("background", "linear-gradient(to bottom left, #64EC7E, #35B35F)")
    } else {
        $messageText.css("background", "linear-gradient(to bottom left, #646AEC, #3550B3)")
    }
    const messageTime = new Date(message.created_at);
    const $chatBubble = $(`
        <div class="m-2 w-75 ${user.id === sender?.id ? "float-right" : "float-left"}">
            <div class="d-flex justify-content-between">
                <div class="font-weight-bold">${sender?.name}:</div>
                <div class="text-mute">${messageTime.toLocaleDateString() + " " + messageTime.toLocaleTimeString()}</div>
            </div>
        </div>
    `)
    $chatBubble.append(messageText);
    $chatContent.append($chatBubble);
    setTimeout(() => {
        $chatContent.scrollTop($chatContent[0].scrollHeight - $chatContent.height());
    }, 500);
}

async function showChat() {
    const $chatContent = $("#chat-content");
    $chatContent.empty();
    if (window._infoWindow._location) {

        /**
         * The location here is stored into the window object when the location is clicked
         * it is the *ACTIVE* location which the user just interacted with.
         */
        $("#chat-title").text(window._infoWindow._location.name);
        //show messages in this chat
        for (const message of window._infoWindow._location.messages) {
            await addMessage(message, $chatContent);
        }
    } else {
        $("#chat-title").text(chat);
    }


    $("#chat").css("left", "0");
}

function hideChat() {
    $("#chat").css("left", "-100%");
}

window.onload = () => {
    console.log('initializing socket.io');
    const socket = io(window.BACKEND_URL);

    socket.on("message", data => {
        //console.log("incoming message", data);
        //if the incoming message is for the currently active location, append that meesage to chat
        if (data.location.id === window._infoWindow._location.id) {
            addMessage(data, $("#chat-content"));
        }
    })

    console.log("initializing map");
    marked.setOptions({
        breaks: true
    });

    //initialize map
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 29.718557455282742, lng: -95.51367567423155 },
        zoom: 15,
    });
    const infoWindow = new google.maps.InfoWindow({
        map: map,
    });
    window._infoWindow = infoWindow;
    const placeService = new google.maps.places.PlacesService(map);

    const mapSearch = document.getElementById("map-search");
    const searchBox = new google.maps.places.SearchBox(mapSearch);

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(mapSearch);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      const marker = new google.maps.Marker({
        map,
        icon,
        title: place.name,
        position: place.geometry.location,
      });

      google.maps.event.addDomListener(marker, "click", function () {
        const { formatted_address, formatted_phone_number, name } = place;

        //update ACTIVE marker
        infoWindow._marker = marker;
        updateInfoWindow({
            lng: place.geometry.location.lng(),
            lat: place.geometry.location.lat(),
            name: name,
            address: formatted_address,
            phone_number: formatted_phone_number,
            partnered: false,
            sale: user
        });
        
    });

      // Create a marker for each place.
      markers.push(
        marker
      );
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

    //when the save button is pressed
    window.saveLocation = () => {
        let marker = infoWindow._marker;
        let location = { ...(infoWindow._location) };
        location.name = $("#loc-name").val();
        location.address = $("#loc-address").val();
        location.phone_number = $("#loc-phone").val();
        location.partnered = $("#loc-partnered").prop('checked');
        location.sale = user;

        if (location.id) {
            //update an existing location
            for (const key in location) {
                if (location[key] === null) {
                    location[key] = undefined;
                }
            }
            $.ajax({
                url: `${window.BACKEND_URL}/locations/${location.id}`,
                data: location,
                type: "PUT",
                success: (res) => {
                    marker.setMap(null);
                    addLocatiionMarker(res);
                    toast.notify("Location Saved", {
                        title: "Success!"
                    })
                }
            });
        } else {
            //creating a new location
            $.post(`${window.BACKEND_URL}/locations`,
                location,
                (res) => {
                    let newLoc = res;
                    addLocatiionMarker(newLoc);
                    toast.notify("New Location Created", {
                        title: "Success!"
                    })
                });
        }

        infoWindow.close();
    }

    //when the delete button is pressed
    window.deleteLocation = () => {
        if (infoWindow?._location?.id) {
            $.ajax({
                url: `${window.BACKEND_URL}/locations/${infoWindow?._location?.id}`,
                type: "DELETE",
                success: (res) => {
                    infoWindow._marker?.setMap(null);
                    infoWindow.close();
                }
            });
        }
    }


    //change InfoWindow content and move it.
    const updateInfoWindow = (location) => {
        // console.log("updating to new location:", location);
        //attach latest location with the infoWindow so buttons can access it.
        infoWindow._location = location;
        const isOwner = !location.sale || (user.id == location?.sale?.id);
        infoWindow.setContent(
            `
                <div>
                    <div class="form-group">
                        <label for="loc-name">Name:</label>
                        <input type="text" class="form-control" id="loc-name" ${isOwner ? "" : "disabled"} value="${location.name}"></input>
                    </div>
                    <div class="form-group">
                        <label for="loc-address">Address:</label>
                        <input type="text" class="form-control" id="loc-address" ${isOwner ? "" : "disabled"} value="${location.address}"></input>
                    </div>
                    <div class="form-group">
                        <label for="loc-phone">Phone Number:</label>
                        <input type="text" class="form-control" id="loc-phone" ${isOwner ? "" : "disabled"} value="${location.phone_number}"></input>
                    </div>
                    <div class="row m-0 my-2">
                        <div class="col">
                            <div class="font-weight-bold">
                                Sales: ${location?.sale?.name ?? "Not Assigned"}
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input"  id="loc-partnered" ${isOwner ? "" : "disabled"} ${location.partnered == true ? "checked" : ""}>
                                <label class="form-check-label font-weight-bold" style="vertical-align:sub;" for="loc-partnered">Partnered</label>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end my-2">
                            ${location.messages ?
                `
                                <button class="btn btn-info mx-1" onclick="showChat()">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                                `: ""}
                            ${isOwner ?
                `
                                <button class="btn btn-success mx-1" onclick="saveLocation()">Save</button>
                                ${location.id !== undefined ? '<button class="btn btn-danger mx-1" onclick="deleteLocation()">Delete</button>' : ""}
                                `
                : ""}
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
        console.log(location);
        let icon_url = location.partnered ? "/assets/icon/green-marker.svg" : "/assets/icon/gray-marker.svg";
        if (location.partnered && location.sale?.partnered_marker) {
            icon_url = location.sale?.partnered_marker.url;
        } else if (!location.partnered && location.sale?.assigned_marker) {
            icon_url = location.sale?.assigned_marker.url;
        }

        const locationMarker = new google.maps.Marker({
            position: {
                lat: location.lat,
                lng: location.lng
            },
            map: map,
            icon: {
                url: icon_url,
                scaledSize: new google.maps.Size(50, 50)
            },
        });

        locationMarker.location = location;

        //when an existing location gets clicked
        google.maps.event.addDomListener(locationMarker, "click", function () {
            //update ACTIVE marker
            infoWindow._marker = locationMarker;

            //get the newest location data from backend
            $.get(`${window.BACKEND_URL}/locations/${location?.id}`, (data) => {
                updateInfoWindow(data);
            })
        });
    }

    //when the map is clicked
    map.addListener("click", (event) => {
        hideChat();
        //TODO: use mouse up and mouse down event to prevent misclicks.
        if (event.placeId) {
            //clicking a POI, stop default fetching  of location detail.
            event.stop();

            //get place detail from google
            placeService.getDetails({
                placeId: event.placeId,
            }, ({ formatted_address, formatted_phone_number, name }) => {
                //once the place's information is gathered, output it on the infoWindow as default info
                updateInfoWindow({
                    lng: event.latLng.lng(),
                    lat: event.latLng.lat(),
                    name: name,
                    address: formatted_address,
                    phone_number: formatted_phone_number,
                    partnered: false,
                    sale: user
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
                sale: user
            });
        }
    });

    //send text message
    $("#send-chat-btn").on('click', () => {
        $.ajax({
            url: `${window.BACKEND_URL}/messages`,
            data: {
                sender: user.id,
                location: infoWindow._location,
                text: $("#chat-input").val()
            },
            method: "POST",
            success: (data) => {
                //empty chat input
                $("#chat-input").val("");
            }
        });
    })

    $("#chat-close").on("click", () => {
        hideChat();
    })

    $("#send-image-btn").on('click', () => {
        //open image selection window
        $("#image-input").click();
    })

    $("#image-input").on('change', e => {
        //upload the image
        const fd = new FormData();
        fd.append("files", e.target.files[0]);
        toast.notify("Uploading Image.");
        $.ajax({
            url: `${window.BACKEND_URL}/upload`,
            data: fd,
            method: "POST",
            processData: false,
            contentType: false,
            success: (res) => {
                for (const image of res) {
                    $.ajax({
                        url: `${window.BACKEND_URL}/messages`,
                        data: {
                            sender: user.id,
                            location: infoWindow._location,
                            text: `![image](${image.url})`
                        },
                        method: "POST",
                        success: (data) => {
                            //no longer needed as the server is now broadcasting new messages
                            //addMessage(data, $("#chat-content"));
                        }
                    });
                }
            }
        });
    })

    //load locations from server
    $.get(`${window.BACKEND_URL}/locations`).then((data) => {
        for (const location of data) {
            addLocatiionMarker(location);
        }
    })
}