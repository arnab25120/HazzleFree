import { Service } from "../models/service.model.js";
import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const searchServices=asyncHandler(async(req,res)=>{
    const {category,location,provider,page=1,limit=10}=req.query;

    const query={
        isApproved:true,
        isActive:true,
    }

    if(category){
        query.category=new RegExp(category,"i");
    }

    if(location){
        query.location=new RegExp(location,"i");
    }
    if(provider){
        const matchingUsers=await User.find({
            name:new RegExp(provider,"i"),
        }).select("_id");

        const providerIds=matchingUsers.map((u)=>u._id);

        if(providerIds.length===0){
            return res.status(200).json(new ApiResponse(200,[],"No service found for this provider"))
        }

        query.provider={$in:providerIds};
    }

    //Pagination setup
    const skip=(Number(page)-1)*Number(limit);
    //Run two queries in parallel for performance
    const[services,total]=await Promise.all([
        Service.find(query)
        .populate("provider","name email contactNumber location")
        .sort({createdAt:-1}) //Sort services by newest first
        .skip(skip)
        .limit(Number(limit)),
        Service.countDocuments(query)
    ]);

    res.status(200).json(
        new ApiResponse(200,
            {
                services,
                total,
                currentPage:Number(page),
                totalPage:Math.ceil(total/limit)
            },"Search results"
        )
    )
})

export {searchServices}