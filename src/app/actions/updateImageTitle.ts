"use server"

import { updateImageTitle } from "@/services/images.service"

export async function updateImageTitleAction(id:number, newTitle:string) {
    try{
        return await updateImageTitle(id, newTitle);
    }catch(err) {
        console.error("updateImageTitleAction Error:", err);
        return { error: "Update failed" };
    }
}