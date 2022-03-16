import { Marker } from "@react-google-maps/api";

export default function SearchResultMarker({searchResult, focusOnPlace}) {

	function handleClick() {
		console.log("searchResult", searchResult);
        focusOnPlace({
			placeId: searchResult["place_id"],
			lat: searchResult.geometry.location.lat(),
			lng: searchResult.geometry.location.lng()
		});
    }

	return (
		<Marker
			icon={{
				url: "/assets/icon/white-marker.svg",
				scaledSize: new google.maps.Size(25, 25),
			}}
			position={searchResult.geometry.location}
			onClick={handleClick}
		></Marker>
	);

}
