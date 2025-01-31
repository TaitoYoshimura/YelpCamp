const mmm = JSON.parse(campground)

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: mmm.geometry.coordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
});

const marker1 = new mapboxgl.Marker()
    .setLngLat(mmm.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 10 }).setHTML(
            `<h6>${mmm.title}</h6><p>${mmm.location}</p>`)
    )
    .addTo(map)