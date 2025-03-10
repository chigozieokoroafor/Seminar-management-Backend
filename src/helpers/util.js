// require("dotenv").config("../../.env")
const randToken = require("rand-token")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const fetch = require("node-fetch")
const pdfkit = require("pdfkit")
const PDFDocument = require("pdfkit")
const pdfkitTable = require("pdfkit-table")
const { Readable } = require('stream');
// const cloudinary = require("cloudinary").v2
// const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { google } = require("googleapis")
// const gApiKeys = require("../../gAPIKey.json")
const { ALL_MIME_TYPES, GKEYS } = require("./consts")
// const fs = require("fs")

// cloudinary.config({ api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })


function generateUID(len) {
  return randToken.uid(len ?? 32)
}

function createUserSession (req, d, secret) {
  const expTime = 1000 * 60 * 1 // 1 hour
  const token = jwt.sign({ payload: d }, secret ? secret : process.env.SECRET_KEY, { expiresIn: expTime })
  req.session.token = token;
}


// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "presentations",
//     resource_type: "raw", // Use "raw" for non-image files
//     format: async (req, file) => "pptx", // Ensuring the file remains .pptx
//   },
// });

// const upload = multer({ storage });

const secret = process.env.AUTH_KEY

const backend_url = process.env.BACKEND_BASE_URL

function pExCheck (reqParams, array) {
  let resp = [];
  reqParams = JSON.parse(JSON.stringify(reqParams));
  array.forEach(param => {
    if (!reqParams.hasOwnProperty(param) || reqParams[param] == "") {
      resp.push(param);
    }
  });
  return resp;
}

function pInCheck(reqParams, array) {
  let resp = [];
  if (reqParams) {
    if (Array.isArray(reqParams)) {
      reqParams.forEach(item => {
        if (!array.includes(item)) {
          resp.push(item);
        }
      });
    } else {
      for (let key in reqParams) {
        if (!array.includes(key)) {
          resp.push(key);
        }
      }
    }
  }
  return resp;
}

function generateToken (payload, time, s) {
  const _secret = s ?? secret
  return jwt.sign({ payload: payload }, _secret, { expiresIn: time })
}

function mailSend (subject, to, html, attachments) { //attachments should be an array
  try {
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      // debug:true,
      // logger:true,
      auth: {
        type: "LOGIN",
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PWD,
      },
      // connectionTimeout: 10000, // increase timeout
      // greetingTimeout: 10000
    });

    const mailOptions = {
      from: `"SeMaSy" <${process.env.MAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html,  // html body
    };
    if (attachments) {
      mailOptions.attachments = attachments;
    }

    smtpTransport.sendMail(mailOptions);
    return true
  } catch (err) {
    console.log('sendEmail', err.message);
    return false
  }
}

function destructureToken (token, s) {
  const _secret = s ? s : secret

  try {
    return jwt.verify(token, _secret)?.payload;
  } catch (error) {
    return false

    //   if (error.name === "TokenExpiredError") {
    //     err = "Session Expired.";
    //     err_status = 403;
    //     return false
    // } else if (error.name === "JsonWebTokenError") {
    //     err = "Invalid Token";
    //     err_status = 498;
    //     return false
    // }

  }
};

async function getStudentDetailFronTrackNetque (formId, surname) {
  const url = process.env.NETQUE_TRACK_URL + `?formId=${formId}&surname=${surname}`

  const response = await fetch(url)
  const json = await response.json()
  if (response.status != 200) {

    return { success: false, msg: json?.Message }
  }

  const { Email, StudentName, DepartmentName, ProgrammeTitle, Phone, SemesterTitle } = json

  return { success: true, msg: "Successful", data: { formId: formId, email: Email, name: StudentName, dept: DepartmentName, program: ProgrammeTitle, phone: Phone, session: SemesterTitle?.split(" ")[0] } }

}

function createPDF_ () {
  // date, coordinator-name, 
  // use pdfkit to do this... pdfkit table for the table part  and normal pdf for the remaining part.
  const table_data = [
    {
      name: "Chigozie okoroafor",
      title: "title",
      degree: "degree",
      supervisor: "supervisor"
    }
  ]
  const doc_1 = new pdfkit({ margin: 30, size: "A4" })

  const buffers = []

  doc_1.on("data", buffers.push.bind(buffers))
  doc_1.on("end", () => {
    const pdf = Buffer.concat(buffers)
    console.log("point 1::::::", pdf)
    this.mailSend("Seminar invite", "okoroaforc14@gmail.com", "find attached your invite", [{ filename: "seminarInvite.pdf", content: pdf }])
  })

  doc_1.image("img\\oau logo.jpeg", {
    fit: [50, 50],
    align: 'left',
    valign: 'left'
  })
  doc_1
    // .font('fonts/PalatinoBold.ttf')
    .fontSize(14)
    .text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', 120);
  doc_1
    // .font('fonts/PalatinoBold.ttf')
    .fontSize(14)
    .text('OBAFEMI AWOLOWO UNIVERSITY, ILE-IFE', 180);

  doc_1
    // .font('fonts/PalatinoBold.ttf')
    .fontSize(14)
    .text('POSTGRADUATE SEMINAR', 220);

  const table = {
    headers: ["S/N", "Name", "Seminar Title", "Degree", "Supervisor"],
    rows: table_data.map((data, index) => [index, data?.name, data?.title, data?.degree, data?.status]),
  };

  doc_1.table(table)
  doc_1.end()
}

function sendOutSeminarNotification (data, emails) {
  const tableData = [
    {
      name: "Chigozie Okoroafor", title: `DEVELOPMENT OF A VALIDATED DATASET
AND A FRAMEWORK TO MITIGATE BIAS IN
FACIAL IMAGE PROCESSING [Progress]`, degree: "M.Sc", supervisor: "Dr. Adebayo"
    },
    {
      name: "Jane Doe", title: `DEVELOPMENT OF A VALIDATED DATASET
AND A FRAMEWORK TO MITIGATE BIAS IN
FACIAL IMAGE PROCESSING [Progress]`, degree: "Ph.D", supervisor: "Dr. Smith"
    },
    { name: "Chigozie Okoroafor", title: "Seminar Title", degree: "M.Sc", supervisor: "Dr. Adebayo" },
    { name: "Jane Doe", title: "AI and Machine Learning", degree: "Ph.D", supervisor: "Dr. Smith" },
    { name: "Chigozie Okoroafor", title: "Seminar Title", degree: "M.Sc", supervisor: "Dr. Adebayo" },
    { name: "Jane Doe", title: "AI and Machine Learning", degree: "Ph.D", supervisor: "Dr. Smith" },
  ];

  // Create the PDF document
  const margin = 10
  const defaultFontSize = 14
  const doc = new PDFDocument({ margin: margin, size: "A4", layout: "landscape" });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdf = Buffer.concat(buffers);
    // console.log("Generated PDF:", pdf);

    // Simulate sending email
    this.mailSend("Seminar Invite", emails, "Find attached your invite", [
      { filename: "seminarInvite.pdf", content: pdf },
    ]);
  });

  // Header Section
  doc.moveDown(2),
    doc.image("img/oau logo.jpeg", { fit: [60, 60], align: "left", valign: "left" });
  doc
    .fontSize(defaultFontSize)
    .text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", { align: "center" })
    // .text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", 120)
    .moveDown(0.5);
  doc.text("OBAFEMI AWOLOWO UNIVERSITY, ILE-IFE, NIGERIA", { align: "center" }).moveDown(0.5);
  doc.text("POSTGRADUATE SEMINAR", { align: "center" }).moveDown();
  doc.moveDown(0.5)
  doc.moveTo(margin, 110) // Starting point (x, y)
    //  .lineTo(300, 100) // Ending point (x, y)
    .lineTo(doc.page.width - margin, 110)
    .stroke(); // Apply the stroke

  doc.text(`Dear All,\nOn behalf of the Department, you are cordially invited to the postgraduate seminar presentation with the following details`).moveDown(0.5)

  // Draw Table
  drawTable(doc, tableData);
  doc.moveDown()
  doc.fontSize(defaultFontSize).text(`Venue: Departmental Seminar Room, Foyer I, Computer Building.`, margin, doc.y, { align: "left" }).moveDown()
  doc.text(`Date: Wednesday, November 6th, 2024`, margin, doc.y, { align: "left" }).moveDown()
  doc.text(`Time: 12 pm`, margin, doc.y, { align: "left" }).moveDown()
  doc.text(`Thanks for participating`, margin, doc.y, { align: "left" }).moveDown()
  doc.text(`Aina S. (PHD)`, margin, doc.y, { align: "left" }).moveDown()
  doc.text(`Seminar coordinator`, margin, doc.y, { align: "left" }).moveDown()


  // Finalize the PDF
  doc.end();

  // Optional: Write the PDF to a file for debugging
  // doc.pipe(fs.createWriteStream("seminarInvite.pdf"));
};

// Function to draw a table
function drawTable(doc, data) {
  const tableTop = 200; // Start position of the table
  const rowHeight = 30;
  const cellPadding = 5;
  const columnWidths = [50, 150, 400, 100, 100]; // Widths for S/N, Name, Title, Degree, Supervisor

  // Draw Table Header
  let currentY = tableTop;
  doc.moveDown(0.5)
  doc.fontSize(12).font("Helvetica-Bold");
  const headers = ["S/N", "Name", "Seminar Title", "Degree", "Supervisor"];
  drawRow(doc, currentY, headers, columnWidths, true);
  currentY += rowHeight;

  // Draw Table Rows
  doc.font("Helvetica");
  data.forEach((row, index) => {
    const rowData = [
      index + 1, // S/N
      row.name,
      row.title,
      row.degree,
      row.supervisor,
    ];
    drawRow(doc, currentY, rowData, columnWidths, false);
    currentY += rowHeight;
  });
}

// Function to draw a row
function drawRow(doc, y, rowData, columnWidths, isHeader) {
  let x = 30; // Starting X position (left margin)
  const rowHeight = 50;

  rowData.forEach((cell, columnIndex) => {
    const width = columnWidths[columnIndex];
    const textX = x + 5; // Add padding
    const textY = y + 10; // Center text vertically within the cell

    // Draw Cell Background (optional, for header only)
    if (isHeader) {
      doc.rect(x, y, width, rowHeight).fill("#f2f2f2").fillColor("black");
    } else {
      doc.rect(x, y, width, rowHeight).stroke();
    }

    // Draw Cell Text
    doc.text(String(cell), textX, textY, {
      width: width - 5, // Account for padding
      ellipsis: true, // Add ellipsis if text overflows
    });

    // Move X position to the next cell
    x += width;
  });

  // Draw Row Border (horizontal line)
  doc.rect(30, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
}

// this.createPDF()
const TOKEN_KEYS = {
  "0": process.env.STUDENT_AUTH,
  "1": process.env.SUPERVISOR_AUTH,
  "2": process.env.COORDINATOR_AUTH,
  "3": process.env.ADMIN_AUTH,
}

// console.log("token:::", this.TOKEN_KEYS)

// exports.uploadFileToCloudinary = async function () {
//   const filePath = "C:/Users/OAUDA/Documents/CSC 400 presentation slides.pptx"
//   const x = cloudinary.uploader.upload(filePath, { cloud_name: "dgpnmwhra", allowed_formats: [""] })
//   x.then((resp) => { console.log("responseherrer::::", resp) })
//     .catch((err) => { console.log("err::", err) })
//   // .then((response)=>{
//   //   console.log("fileUpload::::response:::", response)
//   // })
// }

// this.uploadFileToCloudinary()

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

class Google {
  async authenticate() {
    try {
      // Make sure GKEYS is defined
      if (!GKEYS || !GKEYS.client_email || !GKEYS.private_key) {
        throw new Error('Google API credentials are missing or invalid');
      }
      const SCOPES = ["https://www.googleapis.com/auth/drive"]

      // console.log("GKEYS.private_key::: ",GKEYS.private_key)
      // console.log("GKEYS.email::: ",GKEYS.client_email)

      const jwtClient = new google.auth.JWT(
        GKEYS.client_email,
        null,
        GKEYS.private_key,
        SCOPES
      );
  
      await jwtClient.authorize();
      console.log("scopes::::",jwtClient.scopes)

      console.log("jwtClient:::", jwtClient)
      return jwtClient;
    } catch (error) {
      console.error('Authentication error::::::', error);
      return null;
    }
  }

  async uploadFile(buffer, fileExt, fileName, folderId = null) {
    try {
      // Check if buffer exists
      if (!buffer) {
        throw new Error('File buffer is required');
      }

      // Get authenticated client
      const authClient = await this.authenticate();
      if(!authClient){
        return null
      }
      const drive = google.drive({ version: 'v3', auth: authClient });
      
      // Determine MIME type
      const mimeType = ALL_MIME_TYPES[fileExt] || 'application/octet-stream';
      
      // Use provided folder ID or default from env
      let fileMetadata = {
        name: fileName
      };
      
      // Set parents array (folder ID)
      if (folderId) {
        fileMetadata.parents = [folderId];
      } else if (process.env.DRIVE_FOLDER_ID) {
        fileMetadata.parents = [process.env.DRIVE_FOLDER_ID];
      }
  
      // Create file in Google Drive
      const response =  await drive.files.create({
        resource: fileMetadata,
        media: {
          body: bufferToStream(buffer),
          mimeType: mimeType
        },
        fields: 'id,name,webViewLink'
      });
      
      // console.log("response:::", response)

      // Make file publicly accessible  
      await this.updateFilePermissions(drive, response.data.id);
      
      return response.data;

    } catch (error) {
      console.error('Upload error:', error);
      return null
      // throw error;
    }
  }

  async updateFilePermissions(drive, fileId) {
    if (!fileId) {
      console.error("No file ID provided for permission update");
      return;
    }
    
    try {
      const permission = {
        role: "reader",
        type: "anyone"
      };
      
      await drive.permissions.create({
        fileId: fileId, 
        requestBody: permission
      });
      
      // Get updated file with public links
      const updatedFile = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink,webContentLink'
      });
      
      return updatedFile.data;
    } catch (error) {
      console.error("Permission update error:", error);
      throw error;
    }
  }
}

module.exports = {
  Google,
  TOKEN_KEYS,
  sendOutSeminarNotification,
  destructureToken,
  mailSend,
  generateToken,
  generateUID,
  pInCheck,
  pExCheck,
  createUserSession,
  backend_url
}

