const nodeMailer = require("nodemailer");
const asyncErrorHandler = require("./asyncErrorHandler");

const sendEmail = asyncErrorHandler(async (options, purpose) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.SMPT_SERVICE,
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  if (purpose === "register") {
    mailOptions = {
      ...mailOptions,
      html: `
      <img src="cid:logo"/>
      <h3>Hi <b>${options.username}</b>,</h3> </br></br>

      <h4>Welcome to Circuit Flare! We are thrilled to have you join us! </h4> </br>
      
      <h4>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, nisi? Quasi, earum laudantium, illo suscipit in architecto doloremque ut voluptates recusandae rerum sapiente veritatis. Tenetur ipsam architecto natus quod itaque.
      </h4> </br>
      
      <h4> Take care! </h4> </br>
      <h4> <b> Circuit Flare </b> </h4>
      `,
      attachments: [
        {
          filename: "circuit_flare.png",
          path: __dirname + "/circuit_flare.png",
          cid: "logo",
        },
      ],
    };

    //to remove text field from the mailOptions so that when a user
    //sees thier email , they will see the content of the mail
    //instead of just the 'text' message when not opened
    //also we need this 'text' field for forgot pw mail
    //but is irrevelant for welcome mail
    delete mailOptions.text;
  } else if (purpose === "order_placed") {
    mailOptions = {
      ...mailOptions,
      html: `
      <img src="cid:logo"/>
      <h3>Hi <b>${options.username}</b>,</h3> </br></br>

      <h4>Your order with id :- <em>${options.orderId}</em> is being placed! </h4> </br>
      
      <h4>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, nisi? Quasi, earum laudantium, illo suscipit in architecto doloremque ut voluptates recusandae rerum sapiente veritatis. Tenetur ipsam architecto natus quod itaque.
      </h4> </br>
      
      <h4> Take care! </h4> </br>
      <h4> <b> Circuit Flare </b> </h4>
      `,
      attachments: [
        {
          filename: "circuit_flare.png",
          path: __dirname + "/circuit_flare.png",
          cid: "logo",
        },
      ],
    };

    //to remove text field from the mailOptions so that when a user
    //sees thier email , they will see the content of the mail
    //instead of just the 'text' message when not opened
    //also we need this 'text' field for forgot pw mail
    //but is irrevelant for welcome mail
    delete mailOptions.text;
  }

  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
