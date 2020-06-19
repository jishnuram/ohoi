var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSF-GoOfeaxau_wLpyUDoNFuhjnFjn0b1K1Y7T9GrmWoShznACMhW5zPJNZnFwY54dDkeGsaKOqtXY/pub?gid=1452773944&single=true&output=csv";
//var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSF-GoOfeaxau_wLpyUDoNFuhjnFjn0b1K1Y7T9GrmWoShznACMhW5zPJNZnFwY54dDkeGsaKOqtXY/pub?gid=1452773944&single=true&output=csv";
//var publicSpreadsheetUrl = "product.csv";

var phone_num = "918129999129";

//  Set up Currency.js
const USD = (value) =>
  currency(value, {
    formatWithSymbol: false,
    symbol: "₹",
    precision: 2,
  });
const VEF = (value) =>
  currency(value, {
    symbol: "₹",
    formatWithSymbol: false,
    precision: 0,
  });

const USD_with_symbol = (value) =>
  currency(value, {
    formatWithSymbol: true,
    symbol: "₹",
    precision: 2,
  });

const VEF_with_symbol = (value) =>
  currency(value, {
    symbol: "₹",
    formatWithSymbol: true,
    precision: 0,
  });

function init() {
  console.log("version 0.18");
  Papa.parse(publicSpreadsheetUrl, {
    download: true,
    header: true,
    complete: showInfo,
  });
}

function validProduct(item) {
  if (
    item["Precio USD"] != "" &&
    item["Precio Base"] != "" &&
    item.Marca != "" &&
    item.Imagen != "" &&
    item.Titulo != "" &&
    item.Descripcion != "" &&
    item["Unidades en stock"] != "" &&
    item["Unidades en stock"] != "#VALUE!" &&
    item["Precio USD"] != "#VALUE!"
  ) {
    console.log("Valid: " + item);
    return true;
  } else {
    console.log("Invalid: " + item);
    return false;
  }
}

function showInfo(data, tabletop) {
  console.log("data", data.data);
  $(".spinner").remove();

  var parsed = "";
  var stock = "";
  var precio = "";
  let lista = document.getElementById("lista");
  var i = 0;
  $.each(data.data, function (y, item) {
    $.trim((item["Precio USD"] = item["Precio USD"]));
    $.trim((item["Precio Base"] = item["Precio Base"]));

    $.trim((item["Unidades en stock"] = item["Unidades en stock"]));
    $.trim((item.Marca = item.Marca));
    $.trim((item.Titulo = item.Titulo));
    $.trim((item.Descripcion = item.Descripcion));
    if (validProduct(item)) {
      console.log("myitems", item)
      stock = item["Unidades en stock"];
      precio = USD_with_symbol(item["Precio USD"]).format();
      halfPrice = item["Precio Base"]

      if ($.isNumeric(parseInt(stock))) {
        //if(isNumberDot(precio) && $.isNumeric(parseInt(stock))){
        parsed += "<div class='item'><div class='div-item-img'>";
        if (item["Unidades en stock"] > 0) {
          parsed += "<img class='item-img'";
          parsed += " src='" + item.Imagen + "'></div>";
          parsed +=
            "<div class='item-desc'><h3 class='desc'>" +
            item.Marca +
            " " +
            item.Titulo +
            "</h3>";
          parsed += "<p>" + item.Descripcion + "</p>";

          parsed +=
            "<input style='height:0px;width:0px;visibility: hidden' type='text' name=" +
            halfPrice +
            " class='halfPrice' value='" +
            halfPrice +
            "' disabled='True'></input>";


          parsed +=
            "<input type='text' name=" +
            item.Titulo +
            " class='price' value='" +
            precio +
            "' disabled='True'></div>";
          parsed +=
            "<div class='item-qtd'><input type='button' class='btn' id='minus' value='-' onclick='process(-1," +
            i +
            ", " +
            stock +
            ", " +
            item["Precio Base"] +
            ")' />";
          parsed +=
            "<input name='quant' class='quant' size='1' type='text' value='0' disabled='True' />";
          parsed +=
            "<input type='button' class='btn' id='plus' value='+' onclick='process(1," +
            i +
            ", " +
            stock +
            ", " +
            item["Precio Base"] +
            ")'><br>";
          parsed += "</div></div>";
        } else {
          // OOS Items
          parsed += "<img class='item-img-out'";
          parsed += " src='" + item.Imagen + "' width='88' height='88'></div>";
          parsed +=
            "<div class='item-desc'><h3 class='desc outofstock'>" +
            item.Marca +
            " " +
            item.Titulo +
            "</h3>";
          parsed += "<p class='outofstock'>" + item.Descripcion + "</p>";
          parsed +=
            "<input type='text' class='price outofstock' value='" +
            precio +
            "' disabled='true'></div>";
          parsed += "<div class='item-qtd'>";
          parsed +=
            "<input name='quant' class='quant outofstock' size='1' type='text' value='0' disabled='True' />";
          parsed += "<br>";
          parsed += "</div></div>";
        }
        i++;
      }
    }
  });
  document.getElementById("lista").innerHTML = parsed;
}

total = 0
function process(update_delta, i, max, halfKgRate) {
  // Update Available Stock
  var qty_available = parseFloat(
    document.getElementsByClassName("quant")[i].value
  );
  if (qty_available <= 0.5 && update_delta > 0) {
    qty_available += 0.5;
  }
  else if (qty_available <= 1 && update_delta < 0) {
    qty_available -= 0.5;
  }
  else {
    qty_available += update_delta;
  }


  if (qty_available < 0) {
    document.getElementsByClassName("quant")[i].value = 0;
  } else if (qty_available > max) {
    document.getElementsByClassName("quant")[i].value = max;
  } else {
    document.getElementsByClassName("quant")[i].value = qty_available;
  }


  var t = 0;
  for (var y = 0; y < document.getElementsByClassName("quant").length; y++) {
    var quantity = document.getElementsByClassName("quant")[y].value
    if (quantity == 0.5) {
      t = t +
        1 *
        USD_with_symbol(document.getElementsByClassName("halfPrice")[y].value)
          .value;
    }
    else {
      t = t +
        parseFloat(document.getElementsByClassName("quant")[y].value) *
        USD_with_symbol(document.getElementsByClassName("price")[y].value)
          .value;
    }

    // t =t +
    //   parseFloat(document.getElementsByClassName("quant")[y].value) *
    //   USD_with_symbol(document.getElementsByClassName("price")[y].value)
    //     .value;
  }

  // Recalculate Total Cart Amount

  // Add price to nav bar
  document.getElementById("total-primary").value = USD_with_symbol(t).format();
  // Rewrite message
  msg();





}

function msg() {
  var d = new Date();
  var months = [
    "January",
    "February",
    "March",
    "Abril",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var base_url = "https://wa.me/" + phone_num + "/?text=";
  var msg =
    "*OHOi* Fisherman's pride" +
    d.getDate() +
    " " +
    months[d.getMonth()] +
    " " +
    d.getFullYear();
  for (var y = 0; y < document.getElementsByClassName("quant").length; y++) {
    if (parseFloat(document.getElementsByClassName("quant")[y].value) > 0) {
      msg +=
        "\r\n" +
        document.getElementsByClassName("quant")[y].value +
        "Kg " +
        document.getElementsByClassName("desc")[y].textContent;
    }
  }
  msg +=
    "\r\n\r\n" +
    "*Total*: " +
    USD_with_symbol(document.getElementById("total-primary").value).format();
  msg +=
    "\r\n\r\n" +
    "Thank you for your order!,\r\We appreciate wonderful customers like you.,\r\Our company's goal is to provide high-quality products.";

  // Add new text to message
  document.getElementById("btn_order").href =
    base_url + encodeURIComponent(msg);
}

window.addEventListener("DOMContentLoaded", init);

