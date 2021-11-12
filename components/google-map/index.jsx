import style from './style.module.css';

export default function GoogleMap() {
    return (
        <>
            <div id="chat" className={style.chat}>
                <h4 id="chat-title" className={style["chat-title"]}>
                    Chat
                </h4>
                <div id="chat-content" className={style["chat-content"]}>
                </div>
                <div id="chat-control" className="p-2">
                    <div className="form-group">
                        <label className="ml-2" htmlFor="chat-input">Message:</label>
                        <textarea className="form-control" id="chat-input" rows="5" style={{resize:"none"}}></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button className="btn btn-warning mx-1 px-3" id="send-image-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button className="btn btn-success mx-1 px-3" id="send-chat-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div id="map" className={style.map}>
            </div>
            <script src="./map-script.js"></script>
        </>
    )
}