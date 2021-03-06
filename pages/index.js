import Map from "../components/map";
import Header from "../components/header";
import { withSession } from "../middlewares/session";
import { ToastContainer } from "react-nextjs-toast";
import { UserContext } from "../context/user-context";
import SocketContext from "../context/socket-context";

export default function Home({ user, googleMapsApiKey }) {
	return (
		<UserContext user={user}>
			<SocketContext>
				<div className="vh-100 d-flex flex-column">
					<Header></Header>
					<Map googleMapsApiKey={googleMapsApiKey}></Map>
					<ToastContainer />
				</div>
			</SocketContext>
		</UserContext>
	);
}

export const getServerSideProps = withSession((context) => {
	const { req } = context;
	return {
		props: {
			user: req.session.get("user") || null,
			googleMapsApiKey: process.env.GOOGLE_MAP_API,
		},
	};
});
