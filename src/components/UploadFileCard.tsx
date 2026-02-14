"use client"
import { useState,useEffect,useRef } from "react"
import { uploadImageAction } from "../app/actions/uploadImage"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import { Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function UploadFileCard({ className }:{className:string}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-4xl font-bold">Upload Image</CardTitle>
                <CardDescription>Please upload an image to the block and type the title of the image.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="UploadForm"
                      action={async function(formData){
                        try {
                            console.log("UPLOAD CALLED");
                            const result = await uploadImageAction(formData);
                            if (result?.error) {
                                alert(result.error)
                                return;
                            }
                            console.log("Successful!")
                            setPreview(null);
                        } catch (err) {
                            console.error("Upload form action failed:", err);
                            alert("Upload failed");
                        }
                    }}
                >
                    <Label htmlFor="title" className="my-3">Title</Label>
                    <input
                        name="title"
                        placeholder="Image title"
                        className="border p-2 mb-5"
                    />
                    <Label htmlFor="file" className="mb-2">Upload File</Label>
                    <Label className="upload-box">
                        <input 
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            name="image"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file) {
                                    console.log("File selected:", file);
                                    const previewURL = URL.createObjectURL(file);
                                    setPreview(previewURL);
                                }
                            }} 
                        />
                        <div 
                            className={`upload-content w-75 h-30 border-2 border-dotted border-gray-300 text-center mt-5 rounded-xl ${preview ? "hidden" : ""}`}
                        >
                            <span className="py-5">Click to upload</span>
                        </div>
                    </Label>
                    {preview && <div className="flex flex-row items-stretch">
                            <a href={preview} className="block h-90 w-full">
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    className="h-full w-full rounded-l-2xl object-cover"
                                    height={360}
                                    width={260}
                                    unoptimized
                                />
                            </a>
                            <Button 
                                type="button"
                                variant="secondary"
                                className="h-90 w-36 flex flex-col gap-4 rounded-l-none rounded-r-2xl"
                                onClick={()=>{
                                    if (fileRef.current) {
                                        fileRef.current.value = ""
                                    }
                                    setPreview(null)
                            }}>
                                <p>Delete the image</p>
                                <Trash className="block"/>
                            </Button>
                        </div>}
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button
                    variant="secondary"
                    type="submit"
                    form="UploadForm"
                    className="w-full"
                >
                    Upload the image
                </Button>
                    
                <Button variant="secondary" className="my-1 w-full">
                    <Link href="/display" >
                        Go to display <ArrowUpRightIcon className="inline"/>
                    </Link>
                </Button>
                    
            </CardFooter>
        </Card>
    )
}