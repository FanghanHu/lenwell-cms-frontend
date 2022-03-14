import { OverlayView } from "@react-google-maps/api";
import style from "./style.module.css";
import { useUser } from "../../context/user-context";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import axios from "axios";
import Button from "react-bootstrap/Button";
import TruckIcon from "../icons/truck";
import ChatIcon from "../icons/chat";
import { toast } from 'react-nextjs-toast'

export default function StoreInfoWindow({ location, setActiveLocation, updateLocation}) {
	const [locationName, setLocationName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [sale, setSale] = useState();
	const [partnered, setpartnered] = useState(false);
	const [saleList, setSaleList] = useState([]);

	useEffect(() => {
		//get a list of sales
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		axios
			.get(`${BACKEND_URL}/users`)
			.then((res) => {
				setSaleList(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

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
		//TODO: send updated location to backend and update local cache
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
			lat: location.lat
		}

		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		if(updatedLocation.id === undefined) {
			//new location
			await axios.post(`${BACKEND_URL}/locations`, updatedLocation);
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

	function handleChat() {
		//TODO: toggle chat panel
	}

	//if the location belongs to the current user, or if it is free to take,
	//or the current user is an admin then it is editable
	const user = useUser();
	const editable =
		user.isAdmin || !location.sale || user.id === location.sale?.id;

	return (
		<OverlayView
			mapPaneName={OverlayView.FLOAT_PANE}
			getPixelPositionOffset={getOffset}
			position={location ?? {lng: 0, lat: 0}}
			style={{display: location ? "block" : "none"}}
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
				</div>
				{/*The tip of this info */}
				<div className={style["anchor-wrapper"]}>
					<div className={style.anchor}></div>
				</div>
			</div>
		</OverlayView>
	);
}
