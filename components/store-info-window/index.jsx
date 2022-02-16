import { OverlayView } from "@react-google-maps/api";
import style from "./style.module.css";
import { useUser } from "../../context/user-context";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";

export default function StoreInfoWindow({ location, setActiveLocation }) {
	const [locationName, setLocationName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [sale, setSale] = useState();
	const [partnered, setpartnered] = useState(false);

    useEffect(() => {
        //update displayed information as location changes
        setLocationName(location.name ?? "");
        setDisplayName(location["display_name"] ?? "");
        setAddress(location.address ?? "");
        setPhone(location.phone ?? "");
        setSale(location.sale ?? undefined);
        setpartnered(location.partnered ?? false);
    }, [location])

	function getOffset(width, height) {
		return {
			x: -(width / 2),
			y: -height - 30,
		};
	}

	function handleClose() {
		setActiveLocation(null);
	}

	function stopPropagation(e) {
		e.stopPropagation();
	}

    //if the location belongs to the current user, or if it is free to take, 
    //or the current user is an admin then it is editable
    const user = useUser();
	const editable = user.isAdmin || !location.sale || user.id === location.sale?.id;

	return (
		<OverlayView
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
					<Form.Label>address:</Form.Label>
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
				<div className="d-flex justify-content-end"></div>
				{/*The tip of this info */}
				<div className={style["anchor-wrapper"]}>
					<div className={style.anchor}></div>
				</div>
			</div>
		</OverlayView>
	);
}
