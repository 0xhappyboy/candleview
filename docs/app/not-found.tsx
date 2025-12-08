import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-xl mb-8">Page Not Found</p>
                <Link
                    href="/"
                    className="text-blue-600 hover:underline"
                >
                    Go back home
                </Link>
            </div>
        </div>
    )
}