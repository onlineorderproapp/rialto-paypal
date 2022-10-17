const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// paypal.configure({
//   mode: "sandbox", //sandbox or live
//   client_id:
//     "AeOHYPq7ZafdnPj1LxGlr5sIAhLjCFi87CaQdDhm-J3larmppeXwRSiJGzlIV7acLYH2CWfsEA36agwZ",
//   client_secret:
//     "EAbIXLzUKagdMy92tSfCepQnijiSCwu9mdFgGzapYZ0x2hBLGPnVQ7pzJ0Kxiu_LuuhDH0_gd_JK5Py-",
// });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/paypal", (req, res) => {
  paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
      "AfjHfj3IoQU96rH_hkSXj-sNuOTqKlADktMgMBD4dNWagka-KHMiyHsLzJEuBv1S6jo97a9AzvLv4SFp",
    client_secret:
      "EEAL7a98xl78HYFv7Pz67OxgiGstyi8Nm4akOjc_QMRtG81HxHrHw5KhulhWlws3MwcCVObJmlbrGRFE",
  });
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `https://paypal-node-server.herokuapp.com/success?amount=${req.query.amount}`,
      cancel_url: "https://paypal-node-server.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: req.query.amount,
              currency: "EUR",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "EUR",
          total: req.query.amount,
        },
        description: "This is the payment description.",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      res.redirect(payment.links[1].href);
    }
  });
});

app.get("/success", (req, res) => {
  // res.send("Success");
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: "EUR",
          total: req.query.amount,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        res.render("success");
      }
    }
  );
});

app.get("cancel", (req, res) => {
  res.render("cancel");
});

app.listen(PORT, () => {
  console.log("Server is running at :" + PORT);
});
