const RATE_CACHE = 60 * 30;
const BITCOIN_CACHE = 60;
const CURRENCY_DECIMALS = 2;
const BITCOIN_DECIMALS = 4;

const EURO = 'EUR';
const US_DOLLAR = 'USD';
const AU_DOLLAR = 'AUD';
const CA_DOLLAR = 'CAD';
const HK_DOLLAR = 'HKD';
const GBP = 'GBP';
const BGN = 'BGN';
const BRL = 'BRL';
const CHF = 'CHF';
const CNY = 'CNY';
const CZK = 'CZK';
const DKK = 'DKK';
const HRK = 'HRK';
const HUF = 'HUF';
const IDR = 'IDR';
const ILS = 'ILS';
const INR = 'INR';
const JPY = 'JPY';
const KRW = 'KRW';
const MXN = 'MXN';
const MYR = 'MYR';
const NOK = 'NOK';
const NZD = 'NZD';
const PHP = 'PHP';
const PLN = 'PLN';
const RON = 'RON';
const RUB = 'RUB';
const SEK = 'SEK';
const SGD = 'SGD';
const THB = 'THB';
const TRY = 'TRY';
const ZAR = 'ZAR';

const SUPPORTED_CURRENCIES = [
    EURO, US_DOLLAR, AU_DOLLAR, CA_DOLLAR, HK_DOLLAR, GBP, BGN, BRL, CHF, CZK, DKK, CNY, HRK, HUF, IDR, ILS, INR,
    JPY, KRW, MXN, MYR, NOK, NZD, PHP, PLN, RON, RUB, SEK, SGD, THB, TRY, ZAR
];


// temp because no settings page yet
const USER_CURRENCY = EURO;


function log(message) {
    console.log('%c [Bittrex Plus] ' + message + ' ', 'background: #222; color: #bada55');
}

function convert_usd(currency, amount) {
    var resp;
    var r_name = "usd_" + currency + "_rate";
    var r_u_name = r_name + "_update";

    if (localStorage.getItem(r_name) != null && localStorage.getItem(r_u_name)) {
        if (localStorage.getItem(r_u_name) + RATE_CACHE > Math.floor(Date.now() / 1000)) {
            return amount / localStorage.getItem(r_name);
        }
    }

    $.ajax({
        url: 'https://api.fixer.io/latest?symbols=USD,' + currency,
        async: false
    }).always(function (data) {
        if (data.rates.USD) {
            log(currency + '/USD rate cached to ' + data.rates.USD);
            localStorage.setItem(r_name, data.rates.USD);
            localStorage.setItem(r_u_name, Math.floor(Date.now() / 1000));
            resp = amount / data.rates.USD;
        }
    });

    return resp;
}

function convert_btc(currency, amount) {
    var btc_price;
    if (localStorage.getItem('btc_price') != null && localStorage.getItem('btc_price_update') != null) {
        if (localStorage.getItem('btc_price_update') + BITCOIN_CACHE > Math.floor(Date.now() / 1000)) {
            btc_price = localStorage.getItem('btc_price');
        }
    }

    if (btc_price == undefined) {
        $.ajax({
            url: 'https://bittrex.com/Api/v2.0/pub/currencies/GetBTCPrice',
            async: false
        }).always(function (data) {
            if (data.success) {
                btc_price = parseFloat(data.result.bpi.USD.rate.replace(",", ""));
                log('BTC/USD rate cached to ' + btc_price);
                localStorage.setItem('btc_price', btc_price);
                localStorage.setItem('btc_price_update', Math.floor(Date.now() / 1000));
            }
        });
    }

    if (currency != US_DOLLAR) {
        return convert_usd(currency, btc_price) * amount;
    } else {
        return btc_price * amount;
    }
}

function get_total_btc_balance(token) {
    var total_btc_balance = 0.0;
    $.ajax({
        url: 'https://bittrex.com/api/v2.0/auth/balance/GetBalances',
        type: 'post',
        data: {'__RequestVerificationToken': token},
        async: false
    }).always(function (data) {
        if (data.success) {
            for (var r in data.result) {
                if (data.result[r].BitcoinMarket || data.result[r].Currency.Currency == 'BTC') {
                    if (data.result[r].Currency.Currency == 'BTC') {
                        var last = 1;
                    } else {
                        var last = data.result[r].BitcoinMarket.Last;
                    }
                    if (data.result[r].Balance.Balance) {
                        var balance = data.result[r].Balance.Balance;

                        if (data.result[r].Currency.Currency == 'BTC') {
                            total_btc_balance += balance;
                        } else {
                            total_btc_balance += balance * last;
                        }
                    }
                }
            }
        }
    });

    return total_btc_balance;
}

function init_footer() {
    $('.container-footer .navbar-right li:nth-child(3)').after('<li class="btplus_ticker"><a><span>1 BTC = ' + convert_btc(USER_CURRENCY, 1).toFixed(BITCOIN_DECIMALS) + ' ' + USER_CURRENCY + '</span></a>');

    setInterval(function () {
        var p = convert_btc(USER_CURRENCY, 1).toFixed(BITCOIN_DECIMALS);
        log("BTC price update to " + p + " " + USER_CURRENCY);
        $('.btplus_ticker span').html('1 BTC = ' + p + ' ' + USER_CURRENCY);
    }, 60000)
}

function init_table(id, btc_balance_index) {
    $('#' + id + ' th:nth-child(' + (btc_balance_index + 1) + ')').after('<th class="col-header col-header-lg-num number sorting btplus_th_balance" tabindex="0" aria-controls="balanceTable" rowspan="1" colspan="1">Est. ' + USER_CURRENCY + ' value</th>')

    // Interactions that change the data in the table
    // when data changes, re-render rows and custom js
    $('#balanceTable_paginate').click(function () {
        $('#' + id).trigger('update_table');
    });
    $('#balanceTable_filter_input2').on('input', function () {
        $('#' + id).trigger('update_table');
    });
    $('#balanceTable_length_option2').on('input', function () {
        $('#' + id).trigger('update_table');
    });
    $('th.col-header').click(function () {
        $('#' + id).trigger('update_table');
    });
    $('button[data-bind="click: balances.queryBalanceSummaryState"]').click(function () {
        $('#' + id).trigger('update_table');
    });

    // Make table sortable on estimated currency amount
    $('.btplus_th_balance').click(function () {
        $('#' + id + ' th:nth-child(' + (btc_balance_index + 1) + ')').click();
    });

    $('#' + id).on('update_table', function () {
        setTimeout(function () {
            update_table(id, btc_balance_index)
        }, 500);
    })
}

function update_table(id, btc_balance_index) {
    $('#' + id + ' tbody > tr').each(function (tr) {
        var rows = $('#' + id + ' tbody > tr');
        var columns = $(rows[tr]).children();
        var btc_val = 0.0;
        columns.each(function (td) {
            var column = $(columns[td]);
            if (td == btc_balance_index) {
                btc_val = column.html();
                if ($(columns[btc_balance_index + 1]).hasClass('btplus_est_eur')) {
                    $(columns[btc_balance_index + 1]).html(convert_btc(USER_CURRENCY, btc_val).toFixed(CURRENCY_DECIMALS));
                } else {
                    column.after('<td class="number btplus_est_eur">' + convert_btc(USER_CURRENCY, btc_val).toFixed(CURRENCY_DECIMALS) + '</td>');
                }
            }
        })
    });
}
