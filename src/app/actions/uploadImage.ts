"use server"
import { uploadImage } from "@/services/images.service"

export async function uploadImageAction(formData: FormData):Promise< void | { error:string }> {
    return uploadImage(formData)
}