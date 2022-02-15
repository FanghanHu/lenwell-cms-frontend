import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import SearchBox from "../search-box";
import SearchResultMarker from "../search-result-marker";
import StoreMarker from "../store-marker";
import MapContext from "../../context/map-context";
import style from "./style.module.css";
import axios from "axios";

const containerStyle = {
	width: "100%",
	height: "100%",
};

const center = {
	lat: 29.718557455282742,
	lng: -95.51367567423155,
};

const libraries = ["places"];

export default function Map({ googleMapsApiKey }) {
	const [zoom, setZoom] = useState(10);
	const [bounds, setBounds] = useState(null);
	const [searchResults, setSearchResults] = useState([]);
	const [locations, setLocations] = useState([]);
	const mapRef = useRef(null);

	function handleZoomChange() {
		setZoom(this.getZoom());
	}

	function handleBoundsChanged() {
		setBounds(this.getBounds());
	}

	function handleLoad(map) {
		mapRef.current = map;
	}

	function addLocation(location) {
		setLocations([...locations, location]);
	}

	function removeLocation(location) {
		setLocations(locations.filter((el) => el !== location));
	}

	useEffect(() => {
		//load locations from backend
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		axios
			.get(`${BACKEND_URL}/locations`)
			.then((res) => {
                setLocations(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	return (
		<LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={zoom}
				onZoomChanged={handleZoomChange}
				onBoundsChanged={handleBoundsChanged}
				onLoad={handleLoad}
			>
				<MapContext map={mapRef.current}>
					<SearchBox onPlacesChanged={setSearchResults} bounds={bounds} />
					{searchResults.map((searchResult, index) => (
						<SearchResultMarker
							key={`search-result-${index}`}
							searchResult={searchResult}
						/>
					))}
					{locations.map((location, index) => (
                        <StoreMarker
                            key={`store-marker-${index}`}
                            location={location}
                            zoom={zoom}
					    />
                    ))}
				</MapContext>
			</GoogleMap>
		</LoadScript>
	);
}
