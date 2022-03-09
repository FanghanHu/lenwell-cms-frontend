import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import SearchBox from "../search-box";
import SearchResultMarker from "../search-result-marker";
import StoreMarker from "../store-marker";
import MapContext from "../../context/map-context";
import style from "./style.module.css";
import axios from "axios";
import StoreInfoWindow from "../store-info-window";

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
    const [activeLocation, setActiveLocation] = useState(null);
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

	useEffect(async () => {
		//load locations from backend
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		const temp = [];
		let res;

		//read locations 100 at a time until all data is read
		do {
			res = await axios.get(`${BACKEND_URL}/locations?_start=${temp.length}&_limit=100`);
			console.log(`reading location data ${temp.length} ~ ${temp.length + res.data.length}:`, res.data);
			temp.push.apply(temp, res.data);
		} while (res.data.length === 100);

		setLocations(temp);
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
                            setActiveLocation={setActiveLocation}
                            location={location}
                            zoom={zoom}
					    />
                    ))}
                    <StoreInfoWindow location={activeLocation} setActiveLocation={setActiveLocation}/>
				</MapContext>
			</GoogleMap>
		</LoadScript>
	);
}
