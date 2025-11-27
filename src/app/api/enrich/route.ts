import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const token = process.env.THE_COMPANIES_API_TOKEN

    if (!token) {
        console.error("Missing THE_COMPANIES_API_TOKEN env var")
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    try {
        const response = await fetch(
            `https://www.thecompaniesapi.com/api/enrich-company-from-email?email=${encodeURIComponent(email)}&token=${token}`
        )

        if (!response.ok) {
            console.error("Upstream API error:", response.status, response.statusText)
            return NextResponse.json({ error: "Failed to fetch company data" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Enrichment API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
