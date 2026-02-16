import { prisma } from '@/lib/prisma';
import { writeFile,mkdir,unlink } from 'fs/promises';
import fs from "fs"
import path from 'path';
import { ActionResult } from '@/types/actionResult';
import { validateImageMeta, validateImageSignature, validateTitle } from './images.validation';

export async function getImages(){
    try {
        return await prisma.images.findMany({
            orderBy: { id: "asc" },
        });
    } catch (err) {
        console.error("Get Images Error:", err);
        return { ok:false,error: `Failed to fetch images: ${err}` };
    }
}

export async function uploadImage(formData: FormData):Promise<ActionResult> {
    try {
        const title = formData.get("title") as string
        const file = formData.get("image") as File

        console.log("UPLOAD CALLED");
        console.log("TITLE:", title);
        console.log("FILE:", file);
        const titleValidation = validateTitle(title);
        if (!titleValidation.ok) {
            console.error("Upload Error:", titleValidation.error);
            return { ok:false, error: titleValidation.error };
        }
        const metaValidation = validateImageMeta(file);
        if (!metaValidation.ok) {
            console.error("Upload Error:", metaValidation.error);
            return { ok:false, error: metaValidation.error };
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const signatureValidation = await validateImageSignature(buffer);
        if (!signatureValidation.ok) {
            console.error("Upload Error:", signatureValidation.error);
            return { ok:false, error: signatureValidation.error };
        }
        if (signatureValidation.data === undefined) {
            return { ok:false, error: "Failed to validate image signature" };
        }
        const filename = `${Date.now()}-${crypto.randomUUID()}.${signatureValidation.data.extension}`
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
                    mimeType: signatureValidation.data.mimeType,
                    size:file.size
                }
            })
        } catch(err) {
            try {
                await unlink(path.join(uploadDir, filename));
            } catch (err) {
                return { ok:false, error:`${err}` };
            }
            return { ok:false, error:`${err}` };
        }
        return { ok:true }
    } catch (err) {
        console.error("Upload Error:", err)
        return { ok:false, error: `${err}` }
    }
}

export async function deleteImage(id:number):Promise<ActionResult> {
    try{
        const basicDir = path.join(process.cwd(), "public/uploads");
        const image = await prisma.images.findUnique({ where: { id } });
        if (!image) {
            console.error("Delete Error:","The DB data of this file isn't existing");
            return { ok:false, error:"Delete Error: The DB data of this file isn't existing." };
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
                console.error("Delete Error: failed to delete file, but DB record removed", err);
                return { ok:false, error:`Failed to delete file, but DB record removed: ${err}` };
            }
        } else {
            console.warn("Delete Warning: file missing, DB record removed");
        }
        return { ok:true };
    } catch(err) {
        console.error(err);
        return { ok:false, error:`${err}` }
    }
}

export async function updateImageTitle(id:number, newTitle:string):Promise<ActionResult> {
    try {
        const titleValidation = validateTitle(newTitle);
        if (!titleValidation.ok) {
            console.error("Update Error:", titleValidation.error);
            return { ok:false, error: titleValidation.error };
        }
        const count = await prisma.images.count({
            where: {
                title: newTitle
            }
        });
        if (count > 0) {
            console.error("Update Error: Title already exists");
            return { ok:false, error: "Update Error: Title already exists" };
        }
        if (newTitle === (await prisma.images.findUnique({ where: { id } }))?.title) {
            console.error("Update Error: New title is the same as the current title");
            return { ok:false, error: "Update Error: New title is the same as the current title" };
        }
        await prisma.images.update({
            where:{
                id: id
            },
            data:{
                title:newTitle
            }
        });
        return { ok:true }
    }catch(err) {
        console.error(err);
        return { ok:false, error:`Update Error:${err}` }
    }
}