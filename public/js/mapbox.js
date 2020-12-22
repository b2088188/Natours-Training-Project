const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);


mapboxgl.accessToken = 'pk.eyJ1IjoieWlzaGFvMDkyNSIsImEiOiJja2l6a2Fsd2QwMjQ5MnlsajIycXBnbGt2In0.wvh2r-9JiF3sTLDsc9TvBA';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/yishao0925/ckizkmd382y1g19rr2qknvviq',
scrollZoom: false
// center: [-118.113491, 34.111745],
// zoom: 10,
// interactive: false
});

const bounds = new mapboxgl.LngLatBounds();


   locations.forEach(loc => {
   	//Create marker
	const el = document.createElement('div');
	el.className = 'marker';
	//Add marker
	new mapboxgl.Marker({
		element: el,
		anchor: 'bottom'
	})
	.setLngLat(loc.coordinates)
	.addTo(map);
	//Add popup
	new mapboxgl.Popup({
		offset: 30
	})
			.setLngLat(loc.coordinates)
			.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
			.addTo(map)
	//Extend map bounds to include current location
	bounds.extend(loc.coordinates)
   })
	
map.fitBounds(bounds, {
		padding:  {
		top: 200,
		bottom: 150,
		left: 100,
		right: 100
	}
});