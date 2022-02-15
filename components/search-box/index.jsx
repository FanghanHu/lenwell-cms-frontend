import { StandaloneSearchBox } from "@react-google-maps/api";

export default function SearchBox({onPlacesChanged, bounds}) {
	return (
		<StandaloneSearchBox onPlacesChanged={function() {onPlacesChanged(this.getPlaces())}} bounds={bounds}>
			<input
				type="text"
				placeholder="Search"
				style={{
					boxSizing: `border-box`,
					border: `1px solid transparent`,
					width: `min(400px, 80%)`,
					height: `32px`,
					padding: `0 12px`,
					borderRadius: `3px`,
					boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
					fontSize: `14px`,
					outline: `none`,
					textOverflow: `ellipses`,
					position: "absolute",
					left: "50%",
                    marginTop: "4rem",
					marginLeft: "max(-200px, -40%)",
				}}
			/>
		</StandaloneSearchBox>
	);
}
