import { prisma } from '@/lib/prisma';
import { writeFile,mkdir,unlink } from 'fs/promises';
import fs from "fs"
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

export async function getImages(){
    try {
        return await prisma.images.findMany({
            orderBy: { id: "asc" },
        });
    } catch (err) {
        console.error("Get Images Error:", err);
        throw err;
    }
}

export async function uploadImage(formData: FormData):Promise<void | { error?:string }> {
    try {
        const title = formData.get("title") as string
        const file = formData.get("image") as File

        console.log("UPLOAD CALLED");
        console.log("TITLE:", title);
        console.log("FILE:", file);

        if (!title || !file || file.size === 0) {
            console.error("Upload Error:","Missing title or image file!")
            return { error:"Missing title or image file!" }
        }

        if (!file.type.startsWith('image/')) {
            console.error("Upload Error:","The file is not an image");
            return { error:"The file is not an image" }
        }

        if (file.size > 5000000) {
            console.error("Upload Error:","The image is too large");
            return { error:"The image is too large" }
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const detectedType = await fileTypeFromBuffer(buffer);
        const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
        if (!detectedType || !allowedMimes.has(detectedType.mime)) {
            console.error("Upload Error:", "Unsafe or unsupported image type");
            return { error: "Unsafe or unsupported image type" };
        }

        const filename = `${Date.now()}-${crypto.randomUUID()}.${detectedType.ext}`
        const uploadDir = path.join(process.cwd(), "public/uploads");

        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive:true });
        }
        try{
            await writeFile(
                path.join(uploadDir,filename),
                buffer
            )

            await prisma.images.create({
                data:{
                    title,
                    filename,
                    mimeType: detectedType.mime,
                    size:file.size
                }
            })
        } catch(err) {
            try {
                await unlink(path.join(uploadDir, filename));
            } catch {
                // ignore cleanup failures
            }
            return { error:`${err}` };
        }
    } catch (err) {
        console.error("Upload Error:", err)
        return { error: `${err}` }
    }
}

export async function deleteImage(id:number) {
    try{
        const basicDir = path.join(process.cwd(), "public/uploads");
        const image = await prisma.images.findUnique({ where: { id } });
        if (!image) {
            console.error("Delete Error:","The data isn't existing");
            return { error:"Delete Error: The data isn't existing." };
        }
        const filePath = path.join(basicDir, image.filename);
        const fileExists = fs.existsSync(filePath);

        await prisma.images.delete({
            where:{
                id:id,
            },
        });

        if (fileExists) {
            try {
                await unlink(filePath);
            } catch (err) {
                console.error("Delete Error: failed to delete file", err);
            }
        } else {
            console.warn("Delete Warning: file missing, DB record removed");
        }
    } catch(err) {
        console.error(err);
        return { error:`${err}` }
    }
}