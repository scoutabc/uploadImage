"use server"

import { deleteImage } from "@/services/images.service";

export async function deleteImageAction(id:number) {
    return deleteImage(id);
}