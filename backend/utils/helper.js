export const haversineDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    const lat1 = coord1.lat * (Math.PI / 180.0);
    const lat2 = coord2.lat * (Math.PI / 180.0);
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180.0);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180.0);

    // Haversine formula
    let a = Math.pow(Math.sin(dLat / 2), 2) + 
                   Math.pow(Math.sin(dLng / 2), 2) * 
                   Math.cos(lat1) * 
                   Math.cos(lat2);
    let c = 2 * Math.asin(Math.sqrt(a));


    return R * c;
};

// buildGraph.js
export const buildGraph = (places) => {  
    const graph = {};  
    
    places.forEach((place) => {  
     graph[place.name] = {};  
     places.forEach((otherPlace) => {  
      if (place.name !== otherPlace.name) {  
        const distance = haversineDistance(place, otherPlace);  
        graph[place.name][otherPlace.name] = distance;  
      }  
     });  
    });  
    
    return graph;  
  };
  

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    enqueue(element) {
        this.elements.push(element);
        this.elements.sort((a, b) => a[1] - b[1]); // Sort based on distance
    }

    dequeue() {
        return this.elements.shift(); // Remove and return the first element
    }
}

export const dijkstra = (graph, startNode, endNode) => {  
    // Handle empty graph  
    if (Object.keys(graph).length === 0) {  
     return { path: [], distance: null };  
    }  
    
    // Handle non-existent nodes  
    if (!graph[startNode] || !graph[endNode]) {  
     return { path: [], distance: null };  
    }  
    
    const distances = {};  
    const visited = {};  
    const previous = {};  
    const pq = new PriorityQueue();  
    
    // Initialize distances and previous nodes  
    Object.keys(graph).forEach(node => {  
     distances[node] = Infinity;  
     previous[node] = null;  
    });  
    
    distances[startNode] = 0;  
    pq.enqueue([startNode, 0]);  
    
    while (!pq.isEmpty()) {  
     const [currentNode, currentDistance] = pq.dequeue();  
    
     // Skip already visited nodes  
     if (visited[currentNode]) {  
      continue;  
     }  
    
     visited[currentNode] = true;  
    
     // Check if we reached the end node  
     if (currentNode === endNode) {  
      break; // Early termination if the end node is found  
     }  
    
     // Iterate over neighbors  
     Object.keys(graph[currentNode]).forEach(neighbor => {  
      const distance = currentDistance + graph[currentNode][neighbor];  
    
      // If this new path to neighbor is shorter  
      if (distance < distances[neighbor]) {  
        distances[neighbor] = distance; // Update the shortest distance  
        previous[neighbor] = currentNode; // Track the path  
        pq.enqueue([neighbor, distance]); // Add to the priority queue  
      }  
     });  
    }  
    
    const path = [];  
    let node = endNode;  
    
    while (node !== null) {  
     path.push(node);  
     node = previous[node];  
    }  
    
    path.reverse();  
    
    // Add all nodes to the path  
    const allNodes = Object.keys(graph);  
    allNodes.sort((a, b) => distances[a] - distances[b]);  
    path.splice(1, 0, ...allNodes.filter(node => !path.includes(node)));  
    
    return { path, distance: distances[endNode] };  
  };
  
