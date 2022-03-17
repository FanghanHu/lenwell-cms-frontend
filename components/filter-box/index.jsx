import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { useMap } from "../../context/map-context";
import { useUsers } from "../../context/user-context";
import Cross from "../icons/cross";
import style from "./style.module.css";

export default function FilterBox({setLocations, allLocations, locations, show, setShow, setActiveLocation}) {
    const [sale, setSale] = useState();
    const [visitedWithin, setVisitedWithin] = useState(0);
    const [notVisitedWithin, setNotVisitedWithin] = useState(0);
    const [nameQuery, setNameQuery] = useState("");

    const map = useMap();
    const saleList = useUsers();

    useEffect(() => {
        setLocations(allLocations.filter(location => {
            if(sale) {
                if(sale.id !== location.sale && sale.id !== location?.sale?.id) {
                    return false;
                }
            }

            if(visitedWithin > 0) {
                if(!location["last_visited_time"]) {
                    //never visited before
                     return false;
                } else {
                    const daysPast = (new Date() - new Date(location["last_visited_time"])) / 86400000;
                    if(daysPast > visitedWithin) {
                        return false;
                    }
                }
            }

            if(notVisitedWithin > 0) {
                if(location["last_visited_time"]) {
                    //visited within the time limit
                    const daysPast = (new Date() - new Date(location["last_visited_time"])) / 86400000;
                    if(daysPast < notVisitedWithin) {
                        console.log("excluded");
                        return false;
                    }
                }
            }

            if(nameQuery) {
                if(!location?.name?.toLowerCase()?.match(nameQuery.toLowerCase()) && !location?.["display_name"]?.toLowerCase()?.match(nameQuery.toLowerCase())) {
                    return false;
                }
            }

            return true;
        }));
    }, [allLocations, setLocations, sale, visitedWithin, notVisitedWithin, nameQuery])



    return (
        <div className={`${style.container} ${show ? style.active : ""}`}>
            <div className="d-flex justify-content-end">
				<div
					className="px-2"
					onClick={() => {
						setShow(false);
					}}
				>
					<Cross />
				</div>
			</div>
            <div className="flex-shrink-0 m-2">
                <Form.Group className="my-1">
                    <Form.Label>Name(RegExp):</Form.Label>
                    <Form.Control
                        type="text"
                        value={nameQuery}
                        onChange={(e) => setNameQuery(e.target.value)}
                    />
			    </Form.Group>
                <Form.Group className="my-1">
				<Form.Label>Salesperson:</Form.Label>
                    <Form.Select
                        value={sale ? sale.id : 0}
                        onChange={(e) => {
                                const newSales = saleList.find((sale) => sale.id == e.target.value);
                                setSale(newSales);
                            }
                        }
                    >
                        <option>None</option>
                        {saleList.map((sale) => (
                            <option key={`sale-${sale.id}`} value={sale.id}>
                                {sale.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="my-1">
                    <Form.Label>Visited Within(days):</Form.Label>
                    <Form.Control
                        type="number"
                        value={visitedWithin}
                        onChange={(e) => setVisitedWithin(e.target.value)}
                    />
			    </Form.Group>
                <Form.Group className="my-1">
                    <Form.Label>Not Visited Within(days):</Form.Label>
                    <Form.Control
                        type="number"
                        value={notVisitedWithin}
                        onChange={(e) => setNotVisitedWithin(e.target.value)}
                    />
			    </Form.Group>
                <button className="btn btn-sm btn-warning float-end my-2" onClick={() => {
                    setSale(null);
                    setVisitedWithin("");
                    setNameQuery("");
                }}>
                    Clear Filter
                </button>
            </div>
            <div className="bg-light flex-grow-1 rounded m-1 p-1" style={{overflowY:"auto", overflowX: "hidden"}}>
                {locations.map((location, index) => {
                    return (
                        <button className="btn-success btn-sm w-100 m-1" key={`loc-${index}`} onClick={() => {
                            map.fitBounds(new google.maps.LatLngBounds({
                                lat: location.lat - 0.02,
                                lng: location.lng - 0.02,
                            }, {
                                lat: location.lat + 0.02,
                                lng: location.lng + 0.02,
                            }));
                            setActiveLocation(location);
                        }}>
                            {location?.["display_name"]?.trim().length > 0 ? location["display_name"] : (location.name ?? "unnamed")}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}