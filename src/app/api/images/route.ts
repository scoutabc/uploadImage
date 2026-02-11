import { getImages } from "@/services/images.service";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const images = await getImages();
        console.log("images from DB:", images);
        return NextResponse.json(images);
    } catch (err) {
        console.error("API Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}