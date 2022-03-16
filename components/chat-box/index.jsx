import style from "./style.module.css";
import Cross from "../icons/cross";
import Image from "../icons/image";
import Chat from "../icons/chat";
import { useRef, useState } from "react";
import { toast } from "react-nextjs-toast";
import axios from "axios";
import { useUser, useUsers } from "../../context/user-context";
import Markdown from "marked-react";

export default function ChatBox({
	isActive,
	setShowChatBox,
	location,
	updateLocation,
}) {
	const [input, setInput] = useState("");
	const imageRef = useRef(null);
	const user = useUser();
	const users = useUsers();
	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

	function sendImage(e) {
		//upload the image
		const fd = new FormData();
		fd.append("files", e.target.files[0]);
		toast.notify("Uploading Image.");
		axios({
			url: `${BACKEND_URL}/upload`,
			data: fd,
			method: "POST",
			processData: false,
			contentType: false,
		}).then((res) => {
			for (const image of res.data) {
				axios({
					url: `${BACKEND_URL}/messages`,
					data: {
						sender: user.id,
						location: location,
						text: `![image](${image.url})`,
					},
					method: "POST",
				});
			}
		});
	}

	function sendChat() {
		if (input.trim().length > 0) {
			axios
				.post(`${BACKEND_URL}/messages`, {
					sender: user.id,
					location: location,
					text: input,
				})
				.then((res) => {
					setInput("");
				});
		}
	}

	return (
		<div className={`${style.container} ${isActive && location?.messages ? style.active : ""}`}>
			<div className="d-flex justify-content-end">
				<div
					className="px-2"
					onClick={() => {
						setShowChatBox(false);
					}}
				>
					<Cross />
				</div>
			</div>
			<div className="h4 text-center text-muted m-1">
				{location?.["display_name"]?.length > 0
					? location["display_name"]
					: location?.name}
			</div>
			<div className={style["chat-container"]}>
				{location?.messages?.map((message, index) => {
					const sender = message.sender.id ? message.sender : users.find((el) => el.id === message.sender);
					const messageTime = new Date(message.created_at);
					return (
						<div
							className={`${style["chat-message"]} ${
								sender?.id === user.id ? style["self"] : ""
							}`}
							key={index}
						>
							<div className="d-flex justify-content-between">
								<div className="fw-bold">{sender?.name}:</div>
								<div className="text-muted">{`${messageTime.toLocaleDateString()} ${messageTime.toLocaleTimeString()}`}</div>
							</div>
							<div className={style["chat-bubble"]}>
								<Markdown>{message.text}</Markdown>
							</div>
						</div>
					);
				})}
			</div>
			<div className={style["chat-control"]}>
				<div className="form-group m-2">
					<div className="h5">Message:</div>
					<textarea
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
						}}
						onKeyPress={(e) => {
							//send chat when ctrl+enter is pressed while focused on this element
							if (e.code === "Enter" && e.ctrlKey) {
								e.preventDefault();
								sendChat();
							}
						}}
						className="form-control"
						style={{ resize: "none" }}
						rows={5}
						spellCheck={false}
					></textarea>
				</div>
				<div className="d-flex justify-content-end m-2">
					<input
						type="file"
						ref={imageRef}
						accept="image/"
						className="d-none"
						onChange={sendImage}
					/>
					<button
						className="btn btn-warning mx-1 px-3"
						onClick={() => {
							imageRef.current.click();
						}}
					>
						<Image />
					</button>
					<button className="btn btn-success mx-1 px-3" onClick={sendChat}>
						<Chat />
					</button>
				</div>
			</div>
		</div>
	);
}
