import { OverlayView } from "@react-google-maps/api";
import LocationInfoPanel from "../location-info-panel";
import style from "./style.module.css";

export default function StoreInfoWindow({
	location,
	setActiveLocation,
	updateLocation,
	deleteLocation,
	setShowChatBox,
}) {
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

	return location ? (
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
				onTouchStart={stopPropagation}
				onTouchEnd={stopPropagation}
			>
				<LocationInfoPanel
					location={location}
					setActiveLocation={setActiveLocation}
					updateLocation={updateLocation}
					deleteLocation={deleteLocation}
					setShowChatBox={setShowChatBox}
				/>

				{/*The tip of this info */}
				<div className={style["anchor-wrapper"]}>
					<div className={style.anchor}></div>
				</div>
			</div>
		</OverlayView>
	) : (
		<></>
	);
}
