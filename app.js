const express = require('express')
const https = require('https')
const { google } = require('googleapis')

const app = express()
app.use(express.json())

const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile : "credentials.json",
    scopes : "https://www.googleapis.com/auth/spreadsheets"
  })

  const client = await auth.getClient()

  const sheets = google.sheets({
    version : 'v4',
    auth: client
  })
  return {sheets}
}

//spreadsheetid
const id = '1l73xbkg6QdtlgHeCYFEXDFAhV4cckgb_MH6dsmWrdqU'

//get route
app.get('/', async(req,res) => {
  try {
    const { sheets } = await authentication();
    //reading and storing
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : id,
      range : 'Sheet1',
    })
    res.send(response.data)
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

	const url =
		'https://29fd8c842f4842d3752abbe76991fe74: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@x610s-existence.myshopify.com/admin/api/2022-01/products.json'
  let productsData;
	https.get(url, (response) => {
		console.log(response.statusCode)
		response.on('data', (data) => {
			productsData = data.toString();
      console.log(productsData)
		})
  })

//post route
app.post('/', async (req,res) => {
  try {
    //destructuring input values
    const { orderId, orderName } =  req.body;
    const { sheets } = await authentication()
    //writing to spread sheet
    const writeRequest = await sheets.spreadsheets.values.append({
      spreadsheetId : id,
      range : 'Sheet1',
      valueInputOption : 'USER_ENTERED',
      resource : {
        values : [
          [ orderId, orderName ],
        ]
      }
    })
    //validation
    if(writeRequest.status === 200) {
      return res.json({ msg : 'Spreadsheet updated successfully'})
    }
    return res.json({msg : 'Something went wrong while updating the spreadsheet'})
  } catch(err) {
    console.log('Error updating the spreadsheet',err)
    res.status(500).send()
  }
})

app.listen(3000, () => console.log('Server running on port 3000'))
