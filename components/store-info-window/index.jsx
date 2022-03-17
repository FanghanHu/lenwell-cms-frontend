import { OverlayView } from "@react-google-maps/api";
import style from "./style.module.css";
import { useUser, useUsers } from "../../context/user-context";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import axios from "axios";
import Button from "react-bootstrap/Button";
import TruckIcon from "../icons/truck";
import ChatIcon from "../icons/chat";
import { toast } from 'react-nextjs-toast'

export default function StoreInfoWindow({ location, setActiveLocation, updateLocation, deleteLocation, setShowChatBox}) {
	const [locationName, setLocationName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [sale, setSale] = useState();
	const [partnered, setpartnered] = useState(false);
	const saleList = useUsers();
	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

	useEffect(() => {
		//update displayed information as location changes
		setLocationName(location?.name ?? "");
		setDisplayName(location?.["display_name"] ?? "");
		setAddress(location?.address ?? "");
		setPhone(location?.phone_number ?? "");
		setSale(location?.sale ?? undefined);
		setpartnered(location?.partnered ?? false);
	}, [location]);

	/**
	 * used to calculate window offset on the map
	 * currently points the anchor at the position
	 */
	function getOffset(width, height) {
		return {
			x: -(width / 2),
			y: -height - 30,
		};
	}

	function stopPropagation(e) {
		e.stopPropagation();
	}

	function handleClose() {
		setActiveLocation(null);
	}

	async function handleSave() {
		//send updated location to backend and update local cache
		toast.notify("Saving...", {
			title: "Please Wait",
		});

		const updatedLocation = {
			id: location.id,
			name: locationName,
			"display_name": displayName,
			address: address,
			"phone_number": phone,
			sale: sale,
			partnered: partnered,
			lng: location.lng,
			lat: location.lat,
		}

		
		if(updatedLocation.id === undefined) {
			//new location
			const res = await axios.post(`${BACKEND_URL}/locations`, updatedLocation);
			updateLocation(res.data);
			toast.notify("Saved", {
				title: "Success",
			});
			setActiveLocation(null);
		} else {
			//update location
			await axios.put(`${BACKEND_URL}/locations/${updatedLocation.id}`, updatedLocation);
			updateLocation(updatedLocation);
			toast.notify("Saved", {
				title: "Success",
			});
			setActiveLocation(null);
		}
	}

	async function handleDelete() {
		//send Delete Request to backend and update local cache
		toast.notify("Deleting...", {
			title: "Please Wait",
		});
		await axios.delete(`${BACKEND_URL}/locations/${location.id}`);
		deleteLocation(location);
		setActiveLocation(null);

		toast.notify("Deleted", {
			title: "Success",
		});
	}

	function handleChat() {
		//toggle chat panel
		setShowChatBox(true);
	}

	function checkIn() {
		//this is about 1 mile
		const allowedDistance = 0.014;

		//checkin without losing input
		if("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(async position => {
				const distance = Math.sqrt(Math.pow(Math.abs(position.coords.latitude - location.lat), 2)
				 + Math.pow(Math.abs(position.coords.longitude - location.lng), 2)) * 69;
				const maxDistance = 2;
				 if(distance < maxDistance) {
					 //only attempt to check in if distance is less than 2 miles
					if(location.id) {
						const now = new Date().toISOString().split("T")[0];
						await axios.put(`${BACKEND_URL}/locations/${location.id}`, {
							"last_visited_time": now
						});
						const updatedLocation = {
							...location,
							"last_visited_time": now
						}
						updateLocation(updatedLocation);
						setActiveLocation(updatedLocation);
					
						toast.notify("You have checked in", {
							title: "Success",
						});
					} else {
						console.error("You can not checkin a location that wasn't saved");
						toast.notify("You can not checkin a location that wasn't saved", {
							title: "Error",
						});
					}
				 } else {
					toast.notify(`You are about ${distance.toFixed(2)} miles away from this location, You must be within ${maxDistance} miles to check in.`, {
						title: "You are too far",
					});
				 }
			}, error => {
				toast.notify("Failed to get geolocation, please check permission.\n" + error, {
					title: "Error",
				});
			})
			
		} else {
			toast.notify("You must enable location service in order to check in", {
				title: "Error",
			});
		}
	}

	//if the location belongs to the current user, or if it is free to take,
	//or the current user is an admin then it is editable
	const user = useUser();
	const editable =
		user.isAdmin || !location?.sale || user.id === location?.sale?.id;

	return (
		location ? <OverlayView
		mapPaneName={OverlayView.FLOAT_PANE}
		getPixelPositionOffset={getOffset}
		position={location}
	>
		<div
			className={style.container}
			onClick={stopPropagation}
			onMouseDown={stopPropagation}
			onDoubleClick={stopPropagation}
		>
			<div className="d-flex justify-content-end m-1">
				<CloseButton onClick={handleClose} />
			</div>
			<Form.Group className="my-1">
				<Form.Label>Location Name:</Form.Label>
				<Form.Control
					type="text"
					value={locationName}
					onChange={(e) => setLocationName(e.target.value)}
					disabled={!editable}
				/>
			</Form.Group>
			<Form.Group className="my-1">
				<Form.Label>Display Name:</Form.Label>
				<Form.Control
					type="text"
					value={displayName}
					onChange={(e) => setDisplayName(e.target.value)}
					disabled={!editable}
				/>
			</Form.Group>
			<Form.Group className="my-1">
				<Form.Label>Address:</Form.Label>
				<Form.Control
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					disabled={!editable}
				/>
			</Form.Group>
			<Form.Group className="my-1">
				<Form.Label>Phone Number:</Form.Label>
				<Form.Control
					type="text"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					disabled={!editable}
				/>
			</Form.Group>
			<Form.Group className="my-1">
				<Form.Label>Salesperson:</Form.Label>
				<Form.Select
					value={sale?.id}
					onChange={(e) => {
							const newSales = saleList.find((sale) => sale.id == e.target.value);
							setSale(newSales);
						}
					}
					disabled={!user.isAdmin}
				>
					<option>None</option>
					{saleList.map((sale) => (
						<option key={`sale-${sale.id}`} value={sale.id}>
							{sale.name}
						</option>
					))}
				</Form.Select>
			</Form.Group>
			
			<div className="d-flex justify-content-end my-2">
				<Form.Group>
					<Form.Check
						type="checkbox"
						label="Partnered"
						checked={partnered}
						onChange={(e) => setpartnered(e.target.checked)}
						disabled={!editable}
					/>
				</Form.Group>
			</div>
			<div className="my-2">
				<Form.Label>Last Check in: </Form.Label>
				<div className="d-flex justify-content-between">
					<div className="h5 text-muted">{location["last_visited_time"]?.split("T")[0] ?? "Never"}</div>
					<button className="btn btn-success btn-sm" disabled={location.id === undefined} onClick={checkIn}>Check in</button>
				</div>
			</div>
			<div className="d-flex justify-content-end">
				{location?.messages ? 
					<Button className="mx-1 text-white" variant="info" onClick={handleChat}>
						<ChatIcon/>
					</Button>
				: null}
				<Button
					className="mx-1"
					variant="primary"
					href={`https://www.google.com/maps/dir/?api=1&destination=${location?.lat},${location?.lng}`}
				>
					<TruckIcon/>
				</Button>
				<Button variant="success" className="mx-1" onClick={handleSave}>
					Save
				</Button>
				{
					location.id ? <Button variant="danger" className="mx-1" onClick={handleDelete} disabled={!editable}>
						Delete
					</Button> : ""
				}
			</div>
			{/*The tip of this info */}
			<div className={style["anchor-wrapper"]}>
				<div className={style.anchor}></div>
			</div>
		</div>
	</OverlayView> : <></>
	);
}
