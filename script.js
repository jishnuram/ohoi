var publicSpreadsheetUrl = "product.csv";

var phone_num = "919904800578";

//  Set up Currency.js
const USD = (value) =>
  currency(value, {
    formatWithSymbol: false,
    precision: 2,
  });
const VEF = (value) =>
  currency(value, {
    symbol: "Bs ",
    formatWithSymbol: false,
    precision: 0,
  });

const USD_with_symbol = (value) =>
  currency(value, {
    formatWithSymbol: true,
    precision: 2,
  });

const VEF_with_symbol = (value) =>
  currency(value, {
    symbol: "Bs ",
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
  console.log(data.data);
  $(".spinner").remove();

  var parsed = "";
  var stock = "";
  var precio = "";
  let lista = document.getElementById("lista");
  var i = 0;
  $.each(data.data, function (y, item) {
    $.trim((item["Precio USD"] = item["Precio USD"]));
    $.trim((item["Unidades en stock"] = item["Unidades en stock"]));
    $.trim((item.Marca = item.Marca));
    $.trim((item.Titulo = item.Titulo));
    $.trim((item.Descripcion = item.Descripcion));
    if (validProduct(item)) {
      stock = item["Unidades en stock"];
      precio = USD_with_symbol(item["Precio USD"]).format();
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
            ")' />";
          parsed +=
            "<input name='quant' class='quant' size='1' type='text' value='0' disabled='True' />";
          parsed +=
            "<input type='button' class='btn' id='plus' value='+' onclick='process(1," +
            i +
            ", " +
            stock +
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

function process(update_delta, i, max) {
  // Update Available Stock
  var qty_available = parseInt(
    document.getElementsByClassName("quant")[i].value
  );
  qty_available += update_delta;
  console.log("QTY Available after click: " + qty_available);
  if (qty_available < 0) {
    document.getElementsByClassName("quant")[i].value = 0;
  } else if (qty_available > max) {
    document.getElementsByClassName("quant")[i].value = max;
  } else {
    document.getElementsByClassName("quant")[i].value = qty_available;
  }

  // Recalculate Total Cart Amount
  var t = 0;
  for (var y = 0; y < document.getElementsByClassName("quant").length; y++) {
    console.log(
      "VEF Amount:" +
        USD_with_symbol(document.getElementsByClassName("price")[y].value) +
        " - Pre-parsing: " +
        document.getElementsByClassName("price")[y].value
    );
    console.log("Y:" + y + " Total:" + t);
    t =
      t +
      parseInt(document.getElementsByClassName("quant")[y].value) *
        USD_with_symbol(document.getElementsByClassName("price")[y].value)
          .value;
  }

  // Add price to nav bar
  document.getElementById("total-primary").value = USD_with_symbol(t).format();
  // Rewrite message
  msg();
}

function msg() {
  var d = new Date();
  var months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  var base_url = "https://wa.me/" + phone_num + "/?text=";
  var msg =
    "*PEDIDO* - Fecha " +
    d.getDate() +
    " " +
    months[d.getMonth()] +
    " " +
    d.getFullYear();
  for (var y = 0; y < document.getElementsByClassName("quant").length; y++) {
    if (parseInt(document.getElementsByClassName("quant")[y].value) > 0) {
      msg +=
        "\r\n" +
        document.getElementsByClassName("quant")[y].value +
        "x " +
        document.getElementsByClassName("desc")[y].textContent;
    }
  }
  msg +=
    "\r\n\r\n" +
    "*Total*: " +
    USD_with_symbol(document.getElementById("total-primary").value).format();
  msg +=
    "\r\n\r\n" +
    "Tu pedido no está confirmado,\r\nespera una respuesta para la confirmación.";

  // Add new text to message
  document.getElementById("btn_order").href =
    base_url + encodeURIComponent(msg);
}

window.addEventListener("DOMContentLoaded", init);
