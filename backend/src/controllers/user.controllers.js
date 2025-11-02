import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const cookieOptions={
    httpOnly:true,
    secure:true,
    sameSite: "Strict",
};

const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch(error)
    {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token"
        )
    }
}

//register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, contactNumber } = req.body;

  // Log to debug
  console.log("Register request body:", req.body);

  // Basic validation
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!role || !["consumer", "provider"].includes(role)) {
    throw new ApiError(400, "Role must be either consumer or provider");
  }

  // If provider, contactNumber is required
  if (role === "provider" && (!contactNumber || contactNumber.trim() === "")) {
    throw new ApiError(400, "Contact number is required for providers");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // ✅ Include contactNumber when creating the user
  const user = await User.create({
    name,
    email,
    password,
    role,
    contactNumber: role === "provider" ? contactNumber : undefined,
  });

  if (!user) throw new ApiError(500, "User could not be created");

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  // Set refreshToken in cookie
  res.cookie("refreshToken", refreshToken, cookieOptions);

  // Response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contactNumber: user.contactNumber,
          isAdmin: user.isAdmin,
        },
        accessToken,
      },
      "User registered successfully"
    )
  );
});


//LoginUser
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );  

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Invalid old password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getUserById=asyncHandler(async(req,res)=>{
  const {id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError(400,"Invalid user ID")
  }

  const user=await User.findById(id).select("-password -refreshToken")

  if(!user){
    throw new ApiError(404,"User not found")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,user,"User profile fetched successfully"))
})

//Soft delete
const deleteUserById=asyncHandler(async(req,res)=>{
  const{id}=req.params
    const user = await User.findById(id);


  if (!user) {
    throw new ApiError(404, "User not found");
  }

//Prevent self-deletion
if(user._id.toString()===req.user._id.toString()){
  throw new ApiError(400,"You cannot delete your own account")
}

user.isActive=false
await user.save({validateBeforeSave:false})


  res
    .status(200)
    .json(new ApiResponse(200, {}, "User deactivated successfully"));

})

export{registerUser,loginUser,logoutUser, refreshAccessToken,changeCurrentPassword,getUserById,deleteUserById}


