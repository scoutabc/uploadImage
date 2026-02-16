"use server"

import { updateImageTitle } from "@/services/images.service"
import { ActionResult } from "@/types/actionResult"

export async function updateImageTitleAction(id:number, newTitle:string): Promise<ActionResult> {
    try{
        return await updateImageTitle(id, newTitle);
    }catch(err) {
        console.error("updateImageTitleAction Error:", err);
        return { ok:false, error: "Update failed" };
    }
}