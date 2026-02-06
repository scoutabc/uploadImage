import { prisma } from '@/lib/prisma';
import { writeFile,mkdir,unlink } from 'fs/promises';
import fs from "fs"
import path from 'path';

export async function getImages(){
    return await prisma.images.findMany({
        orderBy: { id: "asc" },
    });
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
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`
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
                    mimeType:file.type,
                    size:file.size
                }
            })
        } catch(err) {
            if (path.join(uploadDir,filename)){
                await unlink(path.join(uploadDir,filename));
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
        if (!fs.existsSync(path.join(basicDir,image.filename))){
            console.error("Delete Error:","The file isn't existing.")
            return { error:"Delete Error: The file isn't existing." };
        }
        await prisma.images.delete({
            where:{
                id:id,
            },
        });
        await unlink(path.join(basicDir,image.filename));
    } catch(err) {
        console.error(err);
        return { error:`${err}` }
    }
}