import { BoardingForm } from '@/components/dashboard/BoardingForm'

export default function NewBoardingPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#0A1435]">Add New Property</h1>
                <p className="text-gray-500 font-medium mt-1">Fill in the details below to list your boarding house.</p>
            </div>

            <BoardingForm />
        </div>
    )
}
