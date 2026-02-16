import { fileTypeFromBuffer } from "file-type";
import { ActionResult } from "@/types/actionResult";

const MAX_TITLE_LENGTH = 255;
const MAX_IMAGE_SIZE_BYTES = 5_000_000;
const ALLOWED_IMAGE_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export function validateTitle(title: string): ActionResult<string> {
    const normalizedTitle = title.trim();

    if (normalizedTitle === "") {
        return { ok: false, error: "Title cannot be empty!" };
    }

    if (normalizedTitle.length > MAX_TITLE_LENGTH) {
        return { ok: false, error: "Title is too long!" };
    }

    return { ok: true, data: normalizedTitle };
}

export function validateImageMeta(file: File | null | undefined): ActionResult {
    if (!file || file.size === 0) {
        return { ok: false, error: "Missing title or image file!" };
    }

    if (!file.type.startsWith("image/")) {
        return { ok: false, error: "The file is not an image" };
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return { ok: false, error: "The image is too large" };
    }

    return { ok: true };
}

export async function validateImageSignature(
    buffer: Buffer
): Promise<ActionResult<{ mimeType: string; extension: string }>> {
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType || !ALLOWED_IMAGE_MIMES.has(detectedType.mime)) {
        return { ok: false, error: "Unsafe or unsupported image type" };
    }

    return {
        ok: true,
        data: { mimeType: detectedType.mime, extension: detectedType.ext },
    };
}
