import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { useRef, useState } from "react";
import SearchBox from "../search-box";
import SearchResultMarker from "../search-result-marker";
import StoreMarker from "../store-marker";
import MapContext from "../../context/map-context";
import style from "./style.module.css";


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
					<StoreMarker
						icon={"/assets/icon/white-pin.svg"}
						position={center}
						zoom={zoom}
					/>
				</MapContext>
			</GoogleMap>
		</LoadScript>
	);
}
