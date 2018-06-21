(function ($) {
  var _nus = function (data) {
    this._api_ = '/api/v1/shorten/';
    this._form_ = '#nus';
    this._s_date = '#start_date';
    this._e_date = '#end_date';
    this._link = '#link';
    this._brand = '#brand';
    this._errormsg_ = 'Erro na formatação da URL <br /> ' +
      'Exemplo http(s)://lojasrenner.com.br or http(s)://www.lojasrenner.com.br';
  };

  _nus.prototype.init = function () {
    var c_new = false;
    this._start_date_ = $(this._s_date).val();
    this._end_date_ = $(this._e_date).val();
    this._url_ = $(this._link);
    this._brand_ = $(this._brand);
    if (!this.check(this._url_.val())) {
      return this.alert(this._errormsg_, true);
    }
    if(this._start_date_ !== ''){
       c_new = true;
    }

    this.request(this._url_.val(), this._start_date_, this._end_date_, c_new, this._brand_.val());
  };

  _nus.prototype.check = function (s) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  };

  _nus.prototype.alert = function (message, error) {
    var t = error === true ? 'alert-danger' : 'alert-success';

    $('.alert').alert('close');
    $('<div class="alert ' + t + ' alert-dismissible" role=alert>'
      + '<button type=button class=close data-dismiss=alert aria-label=Close><span aria-hidden=true>&times;</span></button>'
      + message
      + '</div>').insertBefore(this._form_);
  };

  _nus.prototype.request = function (url, s_date, e_date, cNew, e_brand) {
    var self = this;
    $.post(self._api_, { long_url: url,brand: e_brand, start_date: s_date, end_date: e_date, c_new: cNew}, function (data) {
      if (data.hasOwnProperty('status_code') && data.hasOwnProperty('status_txt')) {
        if (parseInt(data.status_code) == 200) {

          self._url_.val(data.short_url).select();
          return self.alert('Copie a URL encurtada!');
        } else {
          self._errormsg_ = data.status_txt;
        }
      }
      return self.alert(self._errormsg_, true);
    }).error(function () {
      return self.alert(self._errormsg_, true);
    });
  };

  $(function () {
    var n = new _nus();
    var clipboard = new Clipboard('.btn');

    $(n._form_).on('submit', function (e) {
      e && e.preventDefault();
      n.init();

      clipboard.on('success', function(e) {
        n.alert('Copied to clipboard!');
      });

      clipboard.on('error', function(e) {
        n.alert('Error copying to clipboard', true);
      });
    });
  });

})(window.jQuery);
