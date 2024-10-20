import axios from "axios";
import { buildGraph, dijkstra } from "../utils/helper.js";

const getCoordinates = async (placeName) => {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&addressdetails=1`;
    const response = await axios.get(nominatimUrl);
    const data = response.data;

    if (data.length > 0) {
        const location = data[0];
        return {
            name: placeName,
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
        };
    } else {
        throw new Error('Place not found');
    }
};

export const travel = async (req, res) => {  
    const { places, start, end } = req.body;  
    
    if (!places || places.length < 2) {  
     return res.status(400).json({ error: 'At least two places are required' });  
    }  
    
    if (!start || !end) {  
     return res.status(400).json({ error: 'Start and end places are required' });  
    }  
    
    try {  
     for (let i = 0; i < places.length; i++) {  
      if (!places[i].lat || !places[i].lng) {  
        try {  
         const location = await getCoordinates(places[i].name);  
         places[i] = { ...places[i], lat: location.lat, lng: location.lng };  
        } catch (error) {  
         return res.status(404).json({ error: `Coordinates not found for place: ${places[i].name}` });  
        }  
      }  
     }  
    
     const graph = buildGraph(places);  
    
     if (!graph[start] || !graph[end]) {  
      return res.status(404).json({ error: "Invalid place names for start or end" });  
     }  
    
     const result = dijkstra(graph, start, end);  
     if (!result.path || result.path.length === 0) {  
      return res.status(404).json({ error: 'Path not found' });  
     }  
    
     const geojson = {  
      type: "FeatureCollection",  
      features: places.map(place => ({  
        type: "Feature",  
        properties: {  
         name: place.name,  
         distance: graph[place.name] ? graph[place.name][end] : null,  
        },  
        geometry: {  
         type: "Point",  
         coordinates: [place.lng, place.lat]  
        }  
      }))  
     };  
    
     geojson.features.push(  
      {  
        type: "Feature",  
        properties: { name: start, role: "start" },  
        geometry: {  
         type: "Point",  
         coordinates: [  
          places.find(p => p.name === start)?.lng,  
          places.find(p => p.name === start)?.lat  
         ]  
        }  
      },  
      {  
        type: "Feature",  
        properties: { name: end, role: "end" },  
        geometry: {  
         type: "Point",  
         coordinates: [  
          places.find(p => p.name === end)?.lng,  
          places.find(p => p.name === end)?.lat  
         ]  
        }  
      }  
     );  
    
     return res.json({  
      path: result.path,  
      distance: result.distance,  
      graph,  
      geojson  
     });  
    
    } catch (error) {  
     console.error(error);  
     return res.status(500).json({ error: 'Error calculating shortest path or fetching location data' });  
    }  
  };
  