const fs = require(`fs`)
const db = require('../dataBase/db_config')


const dirPath= './data'
if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath)
}

const dataPath= './data/Daftarmenu.json'
if (!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath, '[]','utf-8')
}


//ambil semua data di contact.json
const loadMenu = () => {
    const fileBuffer = fs.readFileSync('./data/Daftarmenu.json','utf-8')
    const contacts = JSON.parse(fileBuffer)
    return contacts
}

//cari contact berdasarkan nama 
const findMenu = (nama) => {
    const contacts = loadMenu()
    const contact = contacts.find((contact)=>contact.nama.toLowerCase()===nama.toLowerCase())
    return contact
}




module.exports = { loadMenu , findMenu }
