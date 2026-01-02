// app/api/profile/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1312461204/avatars/sample.jpg
    // We need to extract: avatars/sample

    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get everything after 'upload' and the version number (if present)
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");

    // Remove version number if present (starts with 'v' followed by digits)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
}

// Helper function to delete image from Cloudinary
async function deleteCloudinaryImage(imageUrl: string): Promise<boolean> {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);

    if (!publicId) {
      console.error("Could not extract public_id from URL:", imageUrl);
      return false;
    }

    console.log("Attempting to delete image with public_id:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log("Successfully deleted image:", publicId);
      return true;
    } else if (result.result === "not found") {
      console.warn("Image not found in Cloudinary:", publicId);
      return true; // Consider this a success since the image doesn't exist
    } else {
      console.error("Failed to delete image:", result);
      return false;
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete old image from Cloudinary if exists
    if (user.avatar) {
      console.log("Deleting old avatar:", user.avatar);
      await deleteCloudinaryImage(user.avatar);
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload new image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    console.log("Uploaded new avatar:", uploadResponse.secure_url);
    console.log("Public ID:", uploadResponse.public_id);

    // Update user avatar in database
    user.avatar = uploadResponse.secure_url;
    await user.save();

    return NextResponse.json({
      message: "Image uploaded successfully",
      avatar: uploadResponse.secure_url,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE endpoint to allow users to remove their profile picture
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete image from Cloudinary if exists
    if (user.avatar) {
      await deleteCloudinaryImage(user.avatar);

      // Remove avatar from database
      user.avatar = undefined;
      await user.save();

      return NextResponse.json({
        message: "Profile picture removed successfully",
      });
    }

    return NextResponse.json({
      message: "No profile picture to remove",
    });
  } catch (error) {
    console.error("Image deletion error:", error);
    return NextResponse.json(
      { error: "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}
