(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.urlParser = factory());
}(this, (function () { 'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var getQueryParams = function getQueryParams(qs) {
  if (typeof qs !== 'string') {
    return {};
  }

  qs = qs.split('+').join(' ');
  var params = {};
  var match = qs.match(/(?:[?](?:[^=]+)=(?:[^&#]*)(?:[&](?:[^=]+)=(?:[^&#]*))*(?:[#].*)?)|(?:[#].*)/);
  var split;

  if (match === null) {
    return {};
  }

  split = match[0].substr(1).split(/[&#=]/);

  for (var i = 0; i < split.length; i += 2) {
    params[decodeURIComponent(split[i])] = decodeURIComponent(split[i + 1] || '');
  }

  return params;
};

var combineParams = function combineParams(op) {
  if (_typeof(op) !== 'object') {
    return '';
  }

  op.params = op.params || {};
  var combined = '',
      i = 0,
      keys = Object.keys(op.params);

  if (keys.length === 0) {
    return '';
  } //always have parameters in the same order


  keys.sort();

  if (!op.hasParams) {
    combined += '?' + keys[0] + '=' + op.params[keys[0]];
    i += 1;
  }

  for (; i < keys.length; i += 1) {
    combined += '&' + keys[i] + '=' + op.params[keys[i]];
  }

  return combined;
}; //parses strings like 1h30m20s to seconds


function getLetterTime(timeString) {
  var totalSeconds = 0;
  var timeValues = {
    's': 1,
    'm': 1 * 60,
    'h': 1 * 60 * 60,
    'd': 1 * 60 * 60 * 24,
    'w': 1 * 60 * 60 * 24 * 7
  };
  var timePairs; //expand to "1 h 30 m 20 s" and split

  timeString = timeString.replace(/([smhdw])/g, ' $1 ').trim();
  timePairs = timeString.split(' ');

  for (var i = 0; i < timePairs.length; i += 2) {
    totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs[i + 1] || 's'];
  }

  return totalSeconds;
} //parses strings like 1:30:20 to seconds


function getColonTime(timeString) {
  var totalSeconds = 0;
  var timeValues = [1, 1 * 60, 1 * 60 * 60, 1 * 60 * 60 * 24, 1 * 60 * 60 * 24 * 7];
  var timePairs = timeString.split(':');

  for (var i = 0; i < timePairs.length; i++) {
    totalSeconds += parseInt(timePairs[i], 10) * timeValues[timePairs.length - i - 1];
  }

  return totalSeconds;
}

var getTime = function getTime(timeString) {
  if (typeof timeString === 'undefined') {
    return 0;
  }

  if (timeString.match(/^(\d+[smhdw]?)+$/)) {
    return getLetterTime(timeString);
  }

  if (timeString.match(/^(\d+:?)+$/)) {
    return getColonTime(timeString);
  }

  return 0;
};

var util = {
  getQueryParams: getQueryParams,
  combineParams: combineParams,
  getTime: getTime
};

var getQueryParams$1 = util.getQueryParams;

function UrlParser() {
  var _arr = ['parseProvider', 'parse', 'bind', 'create'];

  for (var _i = 0; _i < _arr.length; _i++) {
    var key = _arr[_i];
    this[key] = this[key].bind(this);
  }

  this.plugins = {};
}

var urlParser = UrlParser;

UrlParser.prototype.parseProvider = function (url) {
  var match = url.match(/(?:(?:https?:)?\/\/)?(?:[^.]+\.)?(\w+)\./i);
  return match ? match[1] : undefined;
};

UrlParser.prototype.parse = function (url) {
  if (typeof url === 'undefined') {
    return undefined;
  }

  var provider = this.parseProvider(url);
  var result;
  var plugin = this.plugins[provider];

  if (!provider || !plugin || !plugin.parse) {
    return undefined;
  }

  result = plugin.parse.call(plugin, url, getQueryParams$1(url));

  if (result) {
    result = removeEmptyParameters(result);
    result.provider = plugin.provider;
  }

  return result;
};

UrlParser.prototype.bind = function (plugin) {
  this.plugins[plugin.provider] = plugin;

  if (plugin.alternatives) {
    for (var i = 0; i < plugin.alternatives.length; i += 1) {
      this.plugins[plugin.alternatives[i]] = plugin;
    }
  }
};

UrlParser.prototype.create = function (op) {
  var vi = op.videoInfo;
  var params = op.params;
  var plugin = this.plugins[vi.provider];
  params = params === 'internal' ? vi.params : params || {};

  if (plugin) {
    op.format = op.format || plugin.defaultFormat;

    if (plugin.formats.hasOwnProperty(op.format)) {
      return plugin.formats[op.format].apply(plugin, [vi, Object.assign({}, params)]);
    }
  }

  return undefined;
};

function removeEmptyParameters(result) {
  if (result.params && Object.keys(result.params).length === 0) {
    delete result.params;
  }

  return result;
}

var parser = new urlParser();
var base = parser;

var combineParams$1 = util.combineParams;
var getTime$1 = util.getTime;

function YouTube() {
  this.provider = 'youtube';
  this.alternatives = ['youtu', 'ytimg'];
  this.defaultFormat = 'long';
  this.formats = {
    short: this.createShortUrl,
    long: this.createLongUrl,
    embed: this.createEmbedUrl,
    shortImage: this.createShortImageUrl,
    longImage: this.createLongImageUrl
  };
  this.imageQualities = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    DEFAULT: 'default',
    HQDEFAULT: 'hqdefault',
    SDDEFAULT: 'sddefault',
    MQDEFAULT: 'mqdefault',
    MAXRESDEFAULT: 'maxresdefault'
  };
  this.defaultImageQuality = this.imageQualities.HQDEFAULT;
  this.mediaTypes = {
    VIDEO: 'video',
    PLAYLIST: 'playlist',
    SHARE: 'share'
  };
}

YouTube.prototype.parseUrl = function (url) {
  var match = url.match(/(?:(?:v|vi|be|videos|embed)\/(?!videoseries)|(?:v|ci)=)([\w-]{11})/i);
  return match ? match[1] : undefined;
};

YouTube.prototype.parseParameters = function (params, result) {
  if (params.start || params.t) {
    params.start = getTime$1(params.start || params.t);
    delete params.t;
  }

  if (params.v === result.id) {
    delete params.v;
  }

  if (params.list === result.id) {
    delete params.list;
  }

  return params;
};

YouTube.prototype.parseMediaType = function (result) {
  if (result.params.list) {
    result.list = result.params.list;
    delete result.params.list;
  }

  if (result.id && !result.params.ci) {
    result.mediaType = this.mediaTypes.VIDEO;
  } else if (result.list) {
    delete result.id;
    result.mediaType = this.mediaTypes.PLAYLIST;
  } else if (result.params.ci) {
    delete result.params.ci;
    result.mediaType = this.mediaTypes.SHARE;
  } else {
    return undefined;
  }

  return result;
};

YouTube.prototype.parse = function (url, params) {
  var result = {
    params: params,
    id: this.parseUrl(url)
  };
  result.params = this.parseParameters(params, result);
  result = this.parseMediaType(result);
  return result;
};

YouTube.prototype.createShortUrl = function (vi, params) {
  var url = 'https://youtu.be/' + vi.id;

  if (params.start) {
    url += '#t=' + params.start;
  }

  return url;
};

YouTube.prototype.createLongUrl = function (vi, params) {
  var url = '';
  var startTime = params.start;
  delete params.start;

  if (vi.mediaType === this.mediaTypes.PLAYLIST) {
    params.feature = 'share';
    url += 'https://youtube.com/playlist';
  }

  if (vi.mediaType === this.mediaTypes.VIDEO) {
    params.v = vi.id;
    url += 'https://youtube.com/watch';
  }

  if (vi.mediaType === this.mediaTypes.SHARE) {
    params.ci = vi.id;
    url += 'https://www.youtube.com/shared';
  }

  if (vi.list) {
    params.list = vi.list;
  }

  url += combineParams$1({
    params: params
  });

  if (vi.mediaType !== this.mediaTypes.PLAYLIST && startTime) {
    url += '#t=' + startTime;
  }

  return url;
};

YouTube.prototype.createEmbedUrl = function (vi, params) {
  var url = '//youtube.com/embed';

  if (vi.mediaType === this.mediaTypes.PLAYLIST) {
    params.listType = 'playlist';
  } else {
    url += '/' + vi.id; //loop hack

    if (params.loop === '1') {
      params.playlist = vi.id;
    }
  }

  if (vi.list) {
    params.list = vi.list;
  }

  url += combineParams$1({
    params: params
  });
  return url;
};

YouTube.prototype.createImageUrl = function (baseUrl, vi, params) {
  var url = baseUrl + vi.id + '/';
  var quality = params.imageQuality || this.defaultImageQuality;
  return url + quality + '.jpg';
};

YouTube.prototype.createShortImageUrl = function (vi, params) {
  return this.createImageUrl('https://i.ytimg.com/vi/', vi, params);
};

YouTube.prototype.createLongImageUrl = function (vi, params) {
  return this.createImageUrl('https://img.youtube.com/vi/', vi, params);
};

base.bind(new YouTube());

var lib = base;

return lib;

})));
