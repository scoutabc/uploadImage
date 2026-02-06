"use client"

import UploadFileCard from "../components/UploadFileCard"

export default function Page(){
    return (
        <div className="bg-gray-100 min-h-screen">
            <UploadFileCard className="w-120 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
        </div>
    )
}