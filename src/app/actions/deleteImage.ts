"use server"

import { deleteImage } from "@/services/images.service";
import { ActionResult } from "@/types/actionResult";

export async function deleteImageAction(id:number): Promise<ActionResult> {
    try {
        return await deleteImage(id);
    } catch (err) {
        console.error("deleteImageAction Error:", err);
        return { ok:false, error: "Delete failed" };
    }
}