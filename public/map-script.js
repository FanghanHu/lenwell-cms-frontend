
async function addMessage(message, $chatContent) {
    const messageText = document.createElement("div");
    //query for sender name if the message doens't come with sender data
    const sender = (typeof message.sender) === "object" ? message.sender : await $.get(`${window.BACKEND_URL}/users/${message.sender}`);
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

async function showChat(location) {
    const $chatContent = $("#chat-content");
    $chatContent.empty();
    if (location) {
        $("#chat-title").text(location.name);
        //show messages in this chat
        for (const message of location.messages) {
            addMessage(message, $chatContent);
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
    const placeService = new google.maps.places.PlacesService(map);

    //when the save button is pressed
    window.saveLocation = () => {
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
                    infoWindow._location.name = res.name;
                    infoWindow._location.address = res.address;
                    infoWindow._location.phone_number = res.phone_number;
                    infoWindow._location.partnered = res.partnered;
                    infoWindow._location.sale = res.sale;
                    infoWindow._marker.setIcon({
                        url: res.partnered ? "/assets/icon/green-marker.svg" : "/assets/icon/gray-marker.svg",
                        scaledSize: new google.maps.Size(50, 50)
                    });
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
                    ${isOwner ?
                `<div class="d-flex justify-content-end my-2">
                            <button class="btn btn-success mx-1" onclick="saveLocation()">Save</button>
                            ${location.id !== undefined ? '<button class="btn btn-danger mx-1" onclick="deleteLocation()">Delete</button>' : ""}
                        </div>`
                : ""}
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
        const locationMarker = new google.maps.Marker({
            position: {
                lat: location.lat,
                lng: location.lng
            },
            map: map,
            icon: {
                url: location.partnered ? "/assets/icon/green-marker.svg" : "/assets/icon/gray-marker.svg",
                scaledSize: new google.maps.Size(50, 50)
            },
        });

        locationMarker.location = location;

        //when an existing location gets clicked
        google.maps.event.addDomListener(locationMarker, "click", function () {
            infoWindow._marker = locationMarker;
            $.get(`${window.BACKEND_URL}/locations/${location?.id}`, (data) => {
                updateInfoWindow(data);
                showChat(data);
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
            method:"POST",
            success: (data) => {
                addMessage(data, $("#chat-content"));
                $("#chat-input").val("");
            }
        });
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
            method:"POST",
            processData: false,
            contentType: false,
            success: (res) => {
                for(const image of res) {
                    $.ajax({
                        url: `${window.BACKEND_URL}/messages`,
                        data: {
                            sender: user.id,
                            location: infoWindow._location,
                            text: `![image](${image.url})`
                        },
                        method:"POST",
                        success: (data) => {
                            addMessage(data, $("#chat-content"));
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