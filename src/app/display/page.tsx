"use client"

import { useEffect, useState } from "react"
import { deleteImageAction } from "../actions/deleteImage"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ImageType } from "@/types/image"

export default function DisplayImage(){
    const [images, setImages] = useState<ImageType[]>([]);
    const [isManaging,setIsManaging] = useState(false);
    const [deleted,setDeleted] = useState(0);
    useEffect(()=>{
        async function load(){
            const res = await fetch("/api/images");
            const data = await res.json();
            setImages(data);
        }
        load();
    },[deleted]);
    return (
        <div className="bg-gray-100 min-h-screen">
            <Button variant="secondary"
                className="w-full bg-gray-300 sticky top-8 z-50"
                onClick={()=>{
                    setIsManaging(!isManaging);
                }}>
                Manage
            </Button>
            <div className="grid grid-cols-3 gap-4">
                {images.map(img => (
                    <div key={img.id} className="border p-2 relative">
                        <a href={`/uploads/${img.filename}`}>
                            <Image src={`/uploads/${img.filename}`} alt={img.title} className=""  width={700} height={800}/>
                        </a>
                        <p className="font-bold text-2xl text-blue-600">
                            {img.title}
                        </p>
                        <Label className="inline font-bold text-xl mr-2">Size:</Label><p className="inline">{(img.size / 1024).toFixed(2)} KB</p>
                        <br />
                        <Label className="inline font-bold text-xl mr-2">Type:</Label><p className="inline">{img.mimeType}</p>
                        {isManaging && 
                        <Button variant="secondary"
                            onClick={async function(){
                                const result = await deleteImageAction(img.id);
                                if (result?.error) {
                                    alert(result.error)
                                    return;
                                }
                                console.log("Delete Successful!")
                                setDeleted(deleted + 1);
                            }}
                            className="absolute top-2 right-2">
                            <Trash />
                        </Button>}
                    </div>
                ))}
            </div>
        </div>
    )
}