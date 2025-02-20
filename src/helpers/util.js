const randToken = require("rand-token")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const fetch = require("node-fetch")
const { success } = require("./statusCodes")

const pdfkit = require("pdfkit")
const PDFDocument = require("pdfkit")
const pdfkitTable = require("pdfkit-table")
const cloudinary = require("cloudinary").v2

cloudinary.config({api_key:process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET})

exports.generateUID = (len) => {
  return randToken.uid(len ?? 32)
}

exports.createUserSession = (req, d, secret)=>{
  const expTime=  1000 * 60 * 1 // 1 hour
  const token = jwt.sign({payload:d}, secret ? secret:process.env.SECRET_KEY, {expiresIn:expTime})
  req.session.token = token;
}

const secret = process.env.AUTH_KEY

exports.backend_url = process.env.BACKEND_BASE_URL

exports.pExCheck = (reqParams, array) => {
  let resp = [];
  reqParams = JSON.parse(JSON.stringify(reqParams));
  array.forEach(param => {
    if (!reqParams.hasOwnProperty(param) || reqParams[param] == "") {
      resp.push(param);
    }
  });
  return resp;
}

exports.pInCheck = (reqParams, array) => {
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

exports.generateToken = (payload, time, s) => {
  const _secret = s ?? secret
  return jwt.sign({ payload: payload }, _secret, { expiresIn: time })
}

exports.mailSend = (subject, to, html, attachments) => { //attachments should be an array
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

exports.destructureToken = (token, s) => {
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

exports.getStudentDetailFronTrackNetque = async (formId, surname) => {
  const url = process.env.NETQUE_TRACK_URL + `?formId=${formId}&surname=${surname}`

  const response = await fetch(url)
  const json = await response.json()
  if (response.status != 200) {

    return { success: false, msg: json?.Message }
  }

  const { Email, StudentName, DepartmentName, ProgrammeTitle, Phone, SemesterTitle } = json

  return { success: true, msg: "Successful", data: { formId: formId, email: Email, name: StudentName, dept: DepartmentName, program: ProgrammeTitle, phone: Phone, session: SemesterTitle?.split(" ")[0] } }

}

exports.createPDF_ =  () => {
  // date, coordinator-name, 
  // use pdfkit to do this... pdfkit table for the table part  and normal pdf for the remaining part.
  const table_data = [
    {
      name:"Chigozie okoroafor",
      title:"title",
      degree:"degree",
      supervisor :"supervisor"
    }
  ]
  const doc_1 = new pdfkit({ margin: 30, size: "A4" })
  
  const buffers = []

  doc_1.on("data", buffers.push.bind(buffers)) 
  doc_1.on("end", ()=>{
    const pdf = Buffer.concat(buffers)
    console.log("point 1::::::",pdf)
    this.mailSend("Seminar invite", "okoroaforc14@gmail.com", "find attached your invite", [{filename: "seminarInvite.pdf", content:pdf}])
  })

  doc_1.image("img\\oau logo.jpeg", {
    fit: [50, 50],
    align: 'left',
    valign: 'left'})
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

exports.sendOutSeminarNotification = function (data, emails) {
  const tableData = [
    { name: "Chigozie Okoroafor", title: `DEVELOPMENT OF A VALIDATED DATASET
AND A FRAMEWORK TO MITIGATE BIAS IN
FACIAL IMAGE PROCESSING [Progress]`, degree: "M.Sc", supervisor: "Dr. Adebayo" },
    { name: "Jane Doe", title: `DEVELOPMENT OF A VALIDATED DATASET
AND A FRAMEWORK TO MITIGATE BIAS IN
FACIAL IMAGE PROCESSING [Progress]`, degree: "Ph.D", supervisor: "Dr. Smith" },
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
    .text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", {align:"center"})
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
  doc.fontSize(defaultFontSize).text(`Venue: Departmental Seminar Room, Foyer I, Computer Building.`,margin, doc.y,  {align:"left" }).moveDown()
  doc.text(`Date: Wednesday, November 6th, 2024`,margin, doc.y, {align:"left"}).moveDown()
  doc.text(`Time: 12 pm`, margin, doc.y,{align:"left"}).moveDown()
  doc.text(`Thanks for participating`,margin, doc.y, {align:"left"}).moveDown()
  doc.text(`Aina S. (PHD)`, margin, doc.y,{align:"left"}).moveDown()
  doc.text(`Seminar coordinator`,margin, doc.y, {align:"left"}).moveDown()
  

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
exports.TOKEN_KEYS = {
  0: process.env.STUDENT_AUTH,
  1: process.env.SUPERVISOR_AUTH,
  2: process.env.COORDINATOR_AUTH,
  3: process.env.ADMIN_AUTH,
}

exports.uploadFileToCloudinary = async function(){
  const filePath = "C:/Users/OAUDA/Documents/CSC 400 presentation slides.pptx"
  const x = cloudinary.uploader.upload(filePath, {cloud_name:"dgpnmwhra", allowed_formats:[""]})
  x.then((resp)=>{console.log("responseherrer::::", resp)})
  .catch((err)=>{console.log("err::", err)})
  // .then((response)=>{
  //   console.log("fileUpload::::response:::", response)
  // })
}

// this.uploadFileToCloudinary()