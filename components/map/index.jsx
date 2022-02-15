import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { useState } from "react";
import StoreMarker from "../store-marker";
import style from "./style.module.css";

const containerStyle = {
	width: "100%",
	height: "100%",
};

const center = {
	lat: 29.718557455282742,
	lng: -95.51367567423155,
};

export default function Map({ googleMapsApiKey }) {
    const [zoom, setZoom] = useState(10);
    const handleZoomChange = function () {
        setZoom(this.getZoom());
    }

	return (
		<LoadScript googleMapsApiKey={googleMapsApiKey}>
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={zoom}
                onZoomChanged={handleZoomChange}
			>
                <StoreMarker icon={"/assets/icon/gray-marker.svg"} position={center} zoom={zoom}/>
            </GoogleMap>
		</LoadScript>
	);
}
