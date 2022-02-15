import { StandaloneSearchBox } from "@react-google-maps/api";
import { useMap } from "../../context/map-context";

export default function SearchBox({ onPlacesChanged, bounds }) {
	const map = useMap();

	function handlePlaceChanged() {
        const places = this.getPlaces();

        //create a new bounds object that covers all search results
        const bounds = new google.maps.LatLngBounds();
        for(const place of places) {
            if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
        }
        //move map to the new bounds
        map.fitBounds(bounds);

		onPlacesChanged(places);
	}

	return (
		<StandaloneSearchBox onPlacesChanged={handlePlaceChanged} bounds={bounds}>
			<input
				type="text"
				placeholder="Search"
				style={{
					boxSizing: `border-box`,
					border: `1px solid transparent`,
					width: `min(400px, 80%)`,
					height: `32px`,
					padding: `0 12px`,
					borderRadius: `3px`,
					boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
					fontSize: `14px`,
					outline: `none`,
					textOverflow: `ellipses`,
					position: "absolute",
					left: "50%",
					marginTop: "4rem",
					marginLeft: "max(-200px, -40%)",
				}}
			/>
		</StandaloneSearchBox>
	);
}
