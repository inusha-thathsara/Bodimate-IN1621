import { BoardingForm } from '@/components/dashboard/BoardingForm'

export default function NewBoardingPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-foreground">Add New Property</h1>
                <p className="text-muted-foreground font-medium mt-1">Fill in the details below to list your boarding house.</p>
            </div>

            <BoardingForm />
        </div>
    )
}
