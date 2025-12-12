import { Navbar } from "@/components/Navbar";


export default function Guide() {

    return (

        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Navbar />
            <div className="flex items-center justify-center min-h-screen">
                <img
                    src="/guide.png"
                    alt="Guide"
                    className="w-full h-full object-cover"
                />

            </div>

        </div>

    )
}