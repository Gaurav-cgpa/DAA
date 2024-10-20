import React, { useState, useEffect } from 'react';  
import { getPath } from "../store/useTravelStore.js";  
import { Line, Scatter, Bar } from 'react-chartjs-2';  
import { Chart, registerables } from 'chart.js';  
  
Chart.register(...registerables);  
  
const TravelPlanner = () => {  
  const [source, setSource] = useState('');  
  const [destination, setDestination] = useState('');  
  const [vias, setVias] = useState(['']);  
  const [graphData, setGraphData] = useState([]);  
  const [totalDistance, setTotalDistance] = useState(0);  
  const [result, setResult] = useState(null);  
  const [distances, setDistances] = useState({});  
  const [placeNames, setPlaceNames] = useState([]);  
  
  const handleSourceChange = (event) => setSource(event.target.value);  
  const handleDestinationChange = (event) => setDestination(event.target.value);  
  const handleViaChange = (index, event) => {  
   const newVias = [...vias];  
   newVias[index] = event.target.value;  
   setVias(newVias);  
  };  
  const handleAddVia = () => setVias([...vias, '']);  
  
  const handleSubmit = async (event) => {  
   event.preventDefault();  
   const places = [  
    { name: source },  
    ...vias.filter(via => via).map(via => ({ name: via })),  
    { name: destination },  
   ];  
  
   try {  
    const response = await getPath({ places, start: source, end: destination });  
    setResult(response);  
    setPlaceNames(places.map(place => place.name));  
   } catch (error) {  
    console.error('Error submitting form:', error);  
   }  
  };  
  
  useEffect(() => {  
   if (result) {  
    const coordinates = result.geojson.features.map(feature => feature.geometry.coordinates);  
    const graphPoints = coordinates.map(coord => ({ x: coord[0], y: coord[1] }));  
    setGraphData(graphPoints);  
  
    const distances = {};  
    for (let i = 0; i < graphPoints.length; i++) {  
      for (let j = i + 1; j < graphPoints.length; j++) {  
       const distance = calculateDistance(graphPoints[i], graphPoints[j]);  
       distances[`${i},${j}`] = distance;  
      }  
    }  
    setDistances(distances);  
  
    const path = result.path;  
    const pathDistances = [];  
    for (let i = 0; i < path.length - 1; i++) {  
      const point1 = path[i];  
      const point2 = path[i + 1];  
      const distance = distances[`${i},${i + 1}`];  
      pathDistances.push(distance);  
    }  
    const totalDistance = pathDistances.reduce((a, b) => a + b, 0);  
    setTotalDistance(totalDistance);  
   }  
  }, [result]);  
  
  const calculateDistance = (point1, point2) => {  
   const lat1 = point1.y;  
   const lon1 = point1.x;  
   const lat2 = point2.y;  
   const lon2 = point2.x;  
  
   const R = 6371; // Earth's radius in kilometers  
   const dLat = (lat2 - lat1) * Math.PI / 180;  
   const dLon = (lon2 - lon1) * Math.PI / 180;  
   const lat1Rad = lat1 * Math.PI / 180;  
   const lat2Rad = lat2 * Math.PI / 180;  
  
   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +  
          Math.cos(lat1Rad) * Math.cos(lat2Rad) *  
          Math.sin(dLon / 2) * Math.sin(dLon / 2);  
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));  
   return R * c; // Distance in kilometers  
  };  
  
  const shortestPathData = {  
   labels: result ? result.path : [],  
   datasets: [  
    {  
      label: 'Shortest Path Visualization',  
      data: graphData.map(point => point.y),  
      borderColor: 'rgba(75, 192, 192, 1)',  
      backgroundColor: 'rgba(75, 192, 192, 0.2)',  
      borderWidth: 2,  
      fill: false,  
      tension: 0.4,  
    },  
   ],  
  };  
  
  const connectivityData = {  
   datasets: [  
    {  
      label: 'Node Connectivity',  
      data: graphData.map((point, index) => ({  
       x: point.x,  
       y: point.y,  
       r: 5, // Radius for the scatter points  
      })),  
      backgroundColor: 'rgba(153, 102, 255, 1)',  
    },  
    {  
      label: 'Connections',  
      data: [], // Initialize for line connections  
      borderColor: 'rgba(75, 192, 192, 1)',  
      fill: false,  
      type: 'line',  
    },  
   ],  
  };  
  
  // Add line connections between nodes, excluding direct connection between first and last nodes  
  if (graphData.length > 1) {  
   const connectionData = [];  
   for (let i = 0; i < graphData.length - 1; i++) {  
    // Only connect the nodes in between the start and end nodes  
    if (i > 0) {  
      connectionData.push({ x: graphData[i].x, y: graphData[i].y });  
      connectionData.push({ x: graphData[i + 1].x, y: graphData[i + 1].y });  
    }  
   }  
   connectivityData.datasets[1].data = connectionData;  
  }  
  
  const heatmapData = {  
   labels: Object.keys(distances).map((key) => {  
    const [place1Index, place2Index] = key.split(',');  
    return `${placeNames[place1Index]} - ${placeNames[place2Index]}`;  
   }),  
   datasets: [  
    {  
      label: 'Distance Heatmap',  
      data: Object.values(distances).map(d => d), // Use distances directly  
      backgroundColor: 'rgba(255, 99, 132, 0.5)',  
    },  
   ],  
  };  
  
  const routeOptimizationData = {  
   labels: result ? result.path : [],  
   datasets: [  
    {  
      label: 'Route Optimization',  
      data: Object.values(distances).map((distance, index) => ({  
       x: index,  
       y: distance,  
      })),  
      borderColor: 'rgba(255, 206, 86, 1)',  
      backgroundColor: 'rgba(255, 206, 86, 0.2)',  
      fill: true,  
    },  
   ],  
  };  
  
  return (  
   <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">  
    <h1 className="text-3xl font-bold text-blue-700 mb-6">Travel Path Planner</h1>  
    <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg shadow-lg space-y-6">  
      <div className="flex space-x-4">  
       <input  
        type="text"  
        name="source"  
        value={source}  
        onChange={handleSourceChange}  
        placeholder="Source"  
        className="border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"  
        required  
       />  
       <input  
        type="text"  
        name="destination"  
        value={destination}  
        onChange={handleDestinationChange}  
        placeholder="Destination"  
        className="border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"  
        required  
       />  
      </div>  
  
      {vias.map((via, index) => (  
       <div key={index} className="flex space-x-4">  
        <input  
          type="text"  
          name="via"  
          value={via}  
          onChange={(event) => handleViaChange(index, event)}  
          placeholder="Via"  
          className="border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"  
        />  
       </div>  
      ))}  
  
      <div className="flex space-x-4">  
       <button  
        type="button"  
        onClick={handleAddVia}  
        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"  
       >  
        Add Another Location  
       </button>  
       <button  
        type="submit"  
        className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"  
       >  
        Submit  
       </button>  
      </div>  
    </form>  
  
    {graphData.length > 0 && (  
      <div className="mt-8 w-full max-w-4xl border border-gray-300 p-6 rounded-lg" style={{ height: '400px' }}>  
       <h2 className="text-2xl font-semibold mb-4">Node Connectivity Chart</h2>  
       <Scatter data={connectivityData} options={{ responsive: true }} />  
      </div>  
    )}  
  
    <div className="mt-8 w-full max-w-4xl border border-gray-300 p-6 rounded-lg" style={{ height: '400px' }}>  
      <h2 className="text-2xl font-semibold mb-4">Shortest Path Chart</h2>  
      <Line data={shortestPathData} options={{ responsive: true }} />  
    </div>  
  
    <div className="mt-8 w-full max-w-4xl border border-gray-300 p-6 rounded-lg" style={{ height: '400px' }}>  
      <h2 className="text-2xl font-semibold mb-4">Distance Heatmap</h2>  
      <Bar data={heatmapData} options={{ responsive: true }} />  
    </div>  
  
    <div className="mt-8 w-full max-w-4xl border border-gray-300 p-6 rounded-lg" style={{ height: '400px' }}>  
      <h2 className="text-2xl font-semibold mb-4">Route Optimization Chart</h2>  
      <Line data={routeOptimizationData} options={{ responsive: true }} />  
    </div>  
  
    {totalDistance > 0 && (  
      <div className="mt-4">  
       <h2 className="text-xl font-semibold">Total Distance: {totalDistance.toFixed(2)} km</h2>  
      </div>  
    )}  
   </div>  
  );  
};  
  
export default TravelPlanner;
