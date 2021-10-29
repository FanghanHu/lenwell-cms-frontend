import styles from '../styles/Home.module.css'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { useEffect } from 'react';
import axios from 'axios';

export default function Home({BACKEND_URL}) {

  useEffect(() => {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 29.718557455282742, lng: -95.51367567423155},
      zoom: 15,
    });
    const placeService = new google.maps.places.PlacesService(map);

    const editLocationWindow = new google.maps.InfoWindow({
      map: map,
      content: "hi"
    })

    const moveInfoWindow = (location) => {
      editLocationWindow.close();
          editLocationWindow.setPosition(location);
          editLocationWindow.open(map);
    }

    const editLocation = (location, name, address, phoneNumber, partnered, salesId) => {
      editLocationWindow.setContent(`
        <div class="p-3">
          <form>
            <div>
              <label for="name">Name: </label>
              <input id="name" type="text" value="${name??""}" />
            </div>
            <div>
              <label for="address">Address: </label>
              <input id="address" type="text" value="${address??""}" />
            </div>
            <div>
              <label for="phone-number">Phone Number: </label>
              <input id="phone-number" type="text" value="${phoneNumber??""}" />
            </div>
            <div>
              <input id="partnered"/ type="checkbox" ${partnered?"checked":""}>
              <label for="partnered">Partnered</label>
            </div>
          </form>
        </div>
      `);
      moveInfoWindow(location);
    }

    const addLocatiionMarker = (location) => {
      const locatioinMarker = new google.maps.Marker({
        position: {
          lat: location.lat,
          lng: location.lng
        },
        map:map,
        icon: {
          url: location.partnered ? "/assets/icon/green-marker.svg" : "/assets/icon/gray-marker.svg",
          scaledSize: new google.maps.Size(50, 50)
        },
      });

      //when an existing location gets clicked
      google.maps.event.addDomListener(locatioinMarker, "click", function() {
          moveInfoWindow(location);
      });
    }

    //get locations from server
    axios.get(`${BACKEND_URL}/locations`).then(({data}) => {
      for(const location of data) {
        addLocatiionMarker(location);
      }
    })

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

    map.addListener("click", (event) => {
      if(event.placeId) {
        //clicking a POI, stop default fetching  of location detail.
        event.stop();

        //get place detail from google
        placeService.getDetails({
          placeId: event.placeId,
        }, ({formatted_address, formatted_phone_number, name}) => {
          //TODO: add correct salesId
          editLocation(event.latLng, name, formatted_address, formatted_phone_number, false, 0);
        })
      } else {
        //clicking on an empty location
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

export async function getStaticProps(context) {
  return {
    props: {
      // GOOGLE_MAP_API: process.env.GOOGLE_MAP_API,
      BACKEND_URL: process.env.BACKEND_URL
    }
  }
}