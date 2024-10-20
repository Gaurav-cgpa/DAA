
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";





export const getCoordinates = async (location) => {
    try {
        const res = await axiosInstance.get('/coordinates', {
            params: { place: location }, 
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        toast.error('Failed to fetch coordinates');
    }
};


export const getPath = async ({ places, start, end }) => {
    try {
   

        const response = await axiosInstance.post('/travel', {
            places, 
            start,
            end,
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        throw error;
    }
};
