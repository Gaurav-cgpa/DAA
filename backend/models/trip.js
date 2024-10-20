import mongoose from "mongoose";

const tripSchema=new mongoose.Schema({

    start:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Location",
    },
    end:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Location",
    },
    distance:{
        type:Number,
    },
});

const Trip = mongoose.model("Trip",tripSchema);

export default Trip;