"use server"

import { deleteImage } from "@/services/images.service";

export async function deleteImageAction(id:number) {
    try {
        return await deleteImage(id);
    } catch (err) {
        console.error("deleteImageAction Error:", err);
        return { error: "Delete failed" };
    }
}