import styles from '../styles/Home.module.css'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { useEffect } from 'react';

export default function Home() {

  useEffect(() => {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 29.718557455282742, lng: -95.51367567423155},
      zoom: 15,
    });

    const testLocations = [
      {
        lat: 29.7130437, 
        lng: -95.5143379
      },
      {
        lat: 29.7170437, 
        lng: -95.5114379
      },
      {
        lat: 29.7180437, 
        lng: -95.5755379
      },
      {
        lat: 29.7145437, 
        lng: -95.5113679
      }
    ]

    //add marker for company location
    const marker = new google.maps.Marker({
      position: {
        lat: 29.7190437, 
        lng: -95.5113379
      },
      map: map,
      icon: {
        url: "/assets/icon/lenwell-logo.svg",
        scaledSize: new google.maps.Size(100, 100)
      },
      animation: google.maps.Animation.DROP
    });
    google.maps.event.addDomListener(marker, 'click', function(){
      console.log(marker);
    });

    //add test markers
    for(const position of testLocations) {
      const testMarker = new google.maps.Marker({
        position: position,
        map:map,
        icon: {
          url: "/assets/icon/green-marker.svg",
          scaledSize: new google.maps.Size(50, 50)
        },
      })
    }

    map.addListener("click", (event) => {
      console.log("click event", event);
      console.log("you clicked " + event.latLng);
      if(event.placeId) {
        console.log("you clicked on place: " + event.placeId);
        event.stop();
        infoWindow.close();
        const jsx = document.getElementById("info-window-content");
        console.log(jsx);
        infoWindow.setContent(
          jsx
        );
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
      }
    });

    



  }, []);

  return (
    <div className={styles.container}>
        <div id="map" style={{
          width: "100VW",
          height: "100VH"
        }}>
        </div>
    </div>
  )
}