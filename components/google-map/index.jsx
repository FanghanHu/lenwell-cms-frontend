import style from './style.module.css';

export default function GoogleMap() {
    return (
        <>
            <div id="map" className={style.map}>
            </div>
            <script src="./map-script.js"></script>
        </>
    )
}