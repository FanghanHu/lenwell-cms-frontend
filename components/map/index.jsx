import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import SearchBox from "../search-box";
import SearchResultMarker from "../search-result-marker";
import StoreMarker from "../store-marker";
import MapContext from "../../context/map-context";
import Filter from "../../components/icons/filter";
import style from "./style.module.css";
import axios from "axios";
import StoreInfoWindow from "../store-info-window";
import { useUser } from "../../context/user-context";
import { useSocket } from "../../context/socket-context";
import ChatBox from "../chat-box";
import reactDom from "react-dom";
import FilterBox from "../filter-box";
import Cross from "../icons/cross";
import LocationInfoPanel from "../location-info-panel";

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
	const [allLocations, setAllLocations] = useState([]);
	const [locations, setLocations] = useState([]);
	const [activeLocation, setActiveLocation] = useState(null);
	const [placeService, setPlaceService] = useState(null);
	const [showChatBox, setShowChatBox] = useState(false);
	const [showFilterBox, setShowFilterBox] = useState(false);
	const mapRef = useRef(null);
	const user = useUser();
	const socket = useSocket();

	useEffect(() => {
		function handleIncomingMessage(message) {
			//append message to the location in the locations array
			const location = allLocations.find(
				(loc) => loc.id === message.location.id
			);
			if (location) {
				const newLocation = {
					...location,
					messages: [...location.messages, message],
				};
				updateLocation(newLocation);

				console.log(message);

				//also update the displayed active location if it this the one getting message
				if (activeLocation?.id === newLocation.id) {
					setActiveLocation(newLocation);
				}
			}
		}
		socket.on("message", handleIncomingMessage);

		return () => {
			socket.off("message", handleIncomingMessage);
		};
	}, [socket, allLocations, activeLocation]);

	function handleZoomChange() {
		setZoom(this.getZoom());
	}

	function handleBoundsChanged() {
		setBounds(this.getBounds());
	}

	function handleLoad(map) {
		mapRef.current = map;
		setPlaceService(new google.maps.places.PlacesService(map));

		//add a button to top right
		const button = document.createElement("div");
		reactDom.render(
			<button
				className="btn btn-warning text-white p-2"
				style={{ margin: "10px" }}
				onClick={() => {
					setShowFilterBox(!showFilterBox);
				}}
			>
				<Filter />
			</button>,
			button
		);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(button);
	}

	function removeLocation(location) {
		setAllLocations(allLocations.filter((el) => el !== location));
	}

	function updateLocation(location) {
		if (!location.id) {
			console.error("Error: trying to update a location without any id");
		}

		//find the location with the same id and replace it
		const newLocations = [...allLocations];
		for (let i = 0; i < newLocations.length; i++) {
			const el = newLocations[i];
			if (el.id === location.id) {
				newLocations[i] = location;
				setAllLocations(newLocations);
				return;
			}
		}

		//add the location to the new array if no same id was found
		newLocations.push(location);
		setAllLocations(newLocations);
	}

	/**
	 * query google for a placeId then focus on it as a new location
	 */
	function focusOnPlace(place) {
		placeService.getDetails(
			{
				placeId: place.placeId,
			},
			({ formatted_address, formatted_phone_number, name }) => {
				//once the place's information is gathered, output it on the infoWindow as default info
				setActiveLocation({
					lng: place.lng,
					lat: place.lat,
					name: name,
					address: formatted_address,
					phone_number: formatted_phone_number,
					partnered: false,
					sale: user,
				});
			}
		);
	}

	function onClick(event) {
		console.log("event", event);
		//console.log("event", event);
		if (event.placeId) {
			//clicking a POI, stop default fetching  of location detail.
			event.stop();

			//get place detail from google
			focusOnPlace({
				placeId: event.placeId,
				lat: event.latLng.lat(),
				lng: event.latLng.lng(),
			});
		} else {
			//click on an empty location
			//open a location without any information
			setActiveLocation({
				lng: event.latLng.lng(),
				lat: event.latLng.lat(),
				partnered: false,
				sale: user,
			});
		}
	}

	useEffect(async () => {
		//load locations from backend
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		const temp = [];
		let res;

		//read locations 100 at a time until all data is read
		do {
			res = await axios.get(
				`${BACKEND_URL}/locations?_start=${temp.length}&_limit=100`
			);
			console.log(
				`reading location data ${temp.length} ~ ${
					temp.length + res.data.length
				}:`,
				res.data
			);
			temp.push.apply(temp, res.data);
		} while (res.data.length === 100);

		setAllLocations(temp);
	}, []);

	return (
		<LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
			<MapContext map={mapRef.current}>
				<div className={`${style["mobile-location-info"]} ${activeLocation ? style.active : ""}`}>
					<LocationInfoPanel
						updateLocation={updateLocation}
						location={activeLocation}
						setActiveLocation={setActiveLocation}
						deleteLocation={removeLocation}
						setShowChatBox={setShowChatBox}
					/>
				</div>
				<ChatBox
					isActive={showChatBox}
					setShowChatBox={setShowChatBox}
					location={activeLocation}
					updateLocation={updateLocation}
				/>
				<FilterBox
					show={showFilterBox}
					setShow={setShowFilterBox}
					setLocations={setLocations}
					allLocations={allLocations}
					locations={locations}
					setActiveLocation={setActiveLocation}
				/>
				<GoogleMap
					mapContainerStyle={containerStyle}
					center={center}
					zoom={zoom}
					onZoomChanged={handleZoomChange}
					onBoundsChanged={handleBoundsChanged}
					onLoad={handleLoad}
					onClick={onClick}
					option={{
						gestureHandling: "greedy"
					}}
				>
					<SearchBox onPlacesChanged={setSearchResults} bounds={bounds} />
					{searchResults.map((searchResult, index) => (
						<SearchResultMarker
							key={`search-result-${index}`}
							searchResult={searchResult}
							focusOnPlace={focusOnPlace}
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
					<StoreInfoWindow
						updateLocation={updateLocation}
						location={activeLocation}
						setActiveLocation={setActiveLocation}
						deleteLocation={removeLocation}
						setShowChatBox={setShowChatBox}
					/>
				</GoogleMap>
			</MapContext>
		</LoadScript>
	);
}
