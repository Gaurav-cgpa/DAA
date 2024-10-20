// import axios from "axios";

// export const coordinates=async(req,res)=>{

//     const placeName = req.query.place;
//     if (!placeName) {
//         return res.status(400).json({ error: 'Place name is required' });
//     }

//     try {
//         const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&addressdetails=1`;


//         const response = await axios.get(nominatimUrl);
//         const data = response.data;

//         if (data.length > 0) {
 
//             const location = data[0];
//             return res.json({
//                 place: placeName,
//                 latitude: location.lat,
//                 longitude: location.lon
//             });
//         } else {
//             return res.status(404).json({ error: 'Place not found' });
//         }
//     } catch (error) {
//         return res.status(500).json({ error: 'Error fetching location data' });
//     }
// };