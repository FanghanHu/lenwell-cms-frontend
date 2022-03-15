import style from "./style.module.css";
import Cross from "../icons/cross";
import Image from "../icons/image";
import Chat from "../icons/chat";
import { useRef, useState } from "react";
import { toast } from "react-nextjs-toast";
import axios from "axios";
import { useUser } from "../../context/user-context";

export default function ChatBox({
	isActive,
	setShowChatBox,
	location,
	updateLocation,
}) {
	const [input, setInput] = useState("");
    const imageRef = useRef(null);
    const user = useUser();

	function sendImage(e) {
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		//upload the image
		const fd = new FormData();
		fd.append("files", e.target.files[0]);
		toast.notify("Uploading Image.");
		axios({
			url: `${BACKEND_URL}/upload`,
			data: fd,
			method: "POST",
			processData: false,
			contentType: false
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
                    success: (data) => {
                        //no longer needed as the server is now broadcasting new messages
                        //addMessage(data, $("#chat-content"));
                    },
                });
            }
        },);
	}

	function sendChat() {}

	return (
		<div className={`${style.container} ${isActive ? style.active : ""}`}>
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
			<div className="h4 text-center text-muted m-1">{location?.name}</div>
			<div className={style["chat-container"]}></div>
			<div className="form-group m-2">
				<div className="h5">Message:</div>
				<textarea
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
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
				<button className="btn btn-warning mx-1 px-3" onClick={() => {
                    imageRef.current.click();
                }}>
					<Image />
				</button>
				<button className="btn btn-success mx-1 px-3">
					<Chat />
				</button>
			</div>
		</div>
	);
}
