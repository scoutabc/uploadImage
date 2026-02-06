import { getImages } from "@/services/images.service";
import { NextResponse } from "next/server";

export async function GET(){
    const images = await getImages();
    console.log("images from DB:", images);
    return NextResponse.json(images);
}