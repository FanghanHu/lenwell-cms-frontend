import { Marker } from "@react-google-maps/api";

export default function StoreMarker({ icon, location, zoom }) {
	let scaledSize;
	if (zoom >= 22) {
		scaledSize = new google.maps.Size(100, 100);
	} else if (zoom >= 18) {
		scaledSize = new google.maps.Size(80, 80);
	} else if (zoom >= 16) {
		scaledSize = new google.maps.Size(50, 50);
	} else if (zoom >= 13) {
		scaledSize = new google.maps.Size(25, 25);
	} else if (zoom >= 10) {
		scaledSize = new google.maps.Size(10, 10);
	} else {
		scaledSize = new google.maps.Size(5, 5);
	}

    let url = "/assets/icon/white-pin.svg";
    
    //update icon depends on if the location is partnered and if the sales person have a custom icon
    if (location.partnered && location.sale?.partnered_marker) {
        url = location.sale?.partnered_marker.url;
    } else if (!location.partnered && location.sale?.assigned_marker) {
        url = location.sale?.assigned_marker.url;
    }

	return (
		<Marker
			icon={{
				url: url,
				scaledSize: scaledSize,
			}}
			position={location}
		/>
	);
}
