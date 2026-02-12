"use server"
import { uploadImage } from "@/services/images.service"

export async function uploadImageAction(formData: FormData):Promise< void | { error?:string }> {
    try {
        return await uploadImage(formData)
    } catch (err) {
        console.error("uploadImageAction Error:", err);
        return { error: "Upload failed" };
    }
}