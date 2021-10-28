import styles from '../styles/Home.module.css'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { useEffect } from 'react';
const { InfoBox } = require("react-google-maps/lib/components/addons/InfoBox");

export default function Home() {

  useEffect(() => {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 29.718557455282742, lng: -95.51367567423155},
      zoom: 15,
    });

    const marker = new google.maps.Marker({
      position: {
        lat: 29.7190437, 
        lng: -95.5117378
      },
      map: map,
      animation: google.maps.Animation.DROP
    })

    const infoWindow = new google.maps.InfoWindow();
    infoWindow.setContent(document.getElementById("info-window-content"));

    //is this click event clicking on a place
    const isIconMouseEvent = (e) => placeId in e;

    map.addListener("click", (event) => {
      console.log("you clicked " + event.latLng);
      if(event.placeId) {
        console.log("you clicked on place: " + event.placeId);
        event.stop();
        infoWindow.close();
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
      }
    });

    google.maps.event.addDomListener(marker, 'click', function(){
      console.log(marker);
    });



  }, []);

  return (
    <div className={styles.container}>
        <div id="map" style={{
          width: "100VW",
          height: "100VH"
        }}>
          <div id="info-window-content">Hi</div>
        </div>
    </div>
  )
}