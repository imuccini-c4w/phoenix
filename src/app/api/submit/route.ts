import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Load the service account credentials from environment variable
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
            throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set')
        }

        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })

        const sheets = google.sheets({ version: 'v4', auth })

        // Extract the spreadsheet ID from the URL
        const spreadsheetId = '15T2Jag4jujC68vtesI-YK2-05v2NXLrVscABvOtv6xU'

        // Prepare the row data
        const timestamp = new Date().toISOString()
        const row = [
            timestamp,
            data.firstName || '',
            data.lastName || '',
            data.workEmail || '',
            data.business?.companyName || '',
            data.business?.industry || '',
            data.business?.country || '',
            data.business?.website || '',
        ]

        // Append the row to the spreadsheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:H', // Adjust sheet name if needed
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row],
            },
        })

        return NextResponse.json({ success: true, message: 'Data saved successfully' })
    } catch (error) {
        console.error('Error saving to Google Sheets:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to save data' },
            { status: 500 }
        )
    }
}
