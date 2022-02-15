import { Marker } from "@react-google-maps/api";

export default function StoreMarker({ icon, position, zoom }) {
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

	return (
		<Marker
			icon={{
				url: icon,
				scaledSize: scaledSize,
			}}
			position={position}
		></Marker>
	);
}
