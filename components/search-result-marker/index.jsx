import { Marker } from "@react-google-maps/api";

export default function SearchResultMarker({searchResult}) {

	return (
		<Marker
			icon={{
				url: "/assets/icon/green-marker.svg",
				scaledSize: new google.maps.Size(25, 25),
			}}
			position={searchResult.geometry.location}
		></Marker>
	);

}
