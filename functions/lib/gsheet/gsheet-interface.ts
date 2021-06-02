import { google, sheets_v4 } from 'googleapis'

const CLIENT_EMAIL = process.env.GSHEET_CLIENT_EMAIL
let PRIVATE_KEY = process.env.GSHEET_PRIVATE_KEY || 'No Private Key Found'
PRIVATE_KEY = PRIVATE_KEY.replace(new RegExp('\\\\n', 'g'), '\n')

const auth = new google.auth.JWT(
  CLIENT_EMAIL,
  undefined,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets'],
  undefined,
)
google.options({ auth })
const sheets = google.sheets('v4')

/**
 * Appends 'rows' to a spreadsheet
 * @param rows Array<Array<string | number | boolean>> Array of rows to be appended
 * @param range <string> I don't think this matters (searches for an existing table within that range "B2:C3" or "B:C")
 * @param sheetID <string>
 * @param sheetName <string>
 * @returns
 */
export async function appendToSheet(
  rows: Array<Array<string | number | boolean>>,
  range: string,
  sheetID: string,
  sheetName: string,
) {
  return new Promise((res, rej) => {
    const body: sheets_v4.Schema$ValueRange = {
      values: rows,
    }
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheetID,
        range: genOutputRange(sheetName, range),
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: true,
        requestBody: body,
      } as sheets_v4.Params$Resource$Spreadsheets$Values$Append,
      (error, response) => {
        if (error) {
          console.log('The API returned an error: ' + error)
          rej(error)
          return
        } else {
          res(response)
        }
      },
    )
  })
}

// --- Formatting Functions

function genOutputRange(sheetName: string, range: string): string {
  return sheetName + '!' + range
}

function genInputRange(sheetName: string, range: string): string {
  return sheetName + '!' + range
}
