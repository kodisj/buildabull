var fetch = require('cross-fetch');
var algosdk = require('algosdk');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var fetch__default = /*#__PURE__*/ _interopDefaultLegacy(fetch);
var algosdk__default = /*#__PURE__*/ _interopDefaultLegacy(algosdk);

var encode_1 = encode$1;

var MSB = 0x80,
  REST = 0x7f,
  MSBALL = ~REST,
  INT = Math.pow(2, 31);

function encode$1(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;

  while (num >= INT) {
    out[offset++] = (num & 0xff) | MSB;
    num /= 128;
  }
  while (num & MSBALL) {
    out[offset++] = (num & 0xff) | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;

  encode$1.bytes = offset - oldOffset + 1;

  return out;
}

var decode$3 = read;

var MSB$1 = 0x80,
  REST$1 = 0x7f;

function read(buf, offset) {
  var res = 0,
    offset = offset || 0,
    shift = 0,
    counter = offset,
    b,
    l = buf.length;

  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError('Could not decode varint');
    }
    b = buf[counter++];
    res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1);

  read.bytes = counter - offset;

  return res;
}

var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);

var length = function (value) {
  return value < N1
    ? 1
    : value < N2
    ? 2
    : value < N3
    ? 3
    : value < N4
    ? 4
    : value < N5
    ? 5
    : value < N6
    ? 6
    : value < N7
    ? 7
    : value < N8
    ? 8
    : value < N9
    ? 9
    : 10;
};

var varint = {
  encode: encode_1,
  decode: decode$3,
  encodingLength: length,
};

var _brrp_varint = varint;

/**
 * @param {Uint8Array} data
 * @param {number} [offset=0]
 * @returns {[number, number]}
 */
const decode$2 = (data, offset = 0) => {
  const code = _brrp_varint.decode(data, offset);
  return [code, _brrp_varint.decode.bytes];
};

/**
 * @param {number} int
 * @param {Uint8Array} target
 * @param {number} [offset=0]
 */
const encodeTo = (int, target, offset = 0) => {
  _brrp_varint.encode(int, target, offset);
  return target;
};

/**
 * @param {number} int
 * @returns {number}
 */
const encodingLength = int => {
  return _brrp_varint.encodingLength(int);
};

/**
 * @param {Uint8Array} aa
 * @param {Uint8Array} bb
 */
const equals$1 = (aa, bb) => {
  if (aa === bb) return true;
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }

  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }

  return true;
};

/**
 * @param {ArrayBufferView|ArrayBuffer|Uint8Array} o
 * @returns {Uint8Array}
 */
const coerce = o => {
  if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array') return o;
  if (o instanceof ArrayBuffer) return new Uint8Array(o);
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error('Unknown type, must be binary type');
};

/**
 * Creates a multihash digest.
 *
 * @template {number} Code
 * @param {Code} code
 * @param {Uint8Array} digest
 */
const create = (code, digest) => {
  const size = digest.byteLength;
  const sizeOffset = encodingLength(code);
  const digestOffset = sizeOffset + encodingLength(size);

  const bytes = new Uint8Array(digestOffset + size);
  encodeTo(code, bytes, 0);
  encodeTo(size, bytes, sizeOffset);
  bytes.set(digest, digestOffset);

  return new Digest(code, size, digest, bytes);
};

/**
 * Turns bytes representation of multihash digest into an instance.
 *
 * @param {Uint8Array} multihash
 * @returns {MultihashDigest}
 */
const decode$1 = multihash => {
  const bytes = coerce(multihash);
  const [code, sizeOffset] = decode$2(bytes);
  const [size, digestOffset] = decode$2(bytes.subarray(sizeOffset));
  const digest = bytes.subarray(sizeOffset + digestOffset);

  if (digest.byteLength !== size) {
    throw new Error('Incorrect length');
  }

  return new Digest(code, size, digest, bytes);
};

/**
 * @param {MultihashDigest} a
 * @param {unknown} b
 * @returns {b is MultihashDigest}
 */
const equals = (a, b) => {
  if (a === b) {
    return true;
  } else {
    const data = /** @type {{code?:unknown, size?:unknown, bytes?:unknown}} */ (b);

    return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals$1(a.bytes, data.bytes);
  }
};

/**
 * @typedef {import('./interface.js').MultihashDigest} MultihashDigest
 */

/**
 * Represents a multihash digest which carries information about the
 * hashing alogrithm and an actual hash digest.
 *
 * @template {number} Code
 * @template {number} Size
 * @class
 * @implements {MultihashDigest}
 */
class Digest {
  /**
   * Creates a multihash digest.
   *
   * @param {Code} code
   * @param {Size} size
   * @param {Uint8Array} digest
   * @param {Uint8Array} bytes
   */
  constructor(code, size, digest, bytes) {
    this.code = code;
    this.size = size;
    this.digest = digest;
    this.bytes = bytes;
  }
}

// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
function base(ALPHABET, name) {
  if (ALPHABET.length >= 255) {
    throw new TypeError('Alphabet too long');
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + ' is ambiguous');
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
  var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
  function encode(source) {
    if (source instanceof Uint8Array);
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array');
    }
    if (source.length === 0) {
      return '';
    }
    // Skip & count leading zeroes.
    var zeroes = 0;
    var length = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    // Allocate enough space in big-endian base58 representation.
    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
    var b58 = new Uint8Array(size);
    // Process the bytes.
    while (pbegin !== pend) {
      var carry = source[pbegin];
      // Apply "b58 = b58 * 256 + ch".
      var i = 0;
      for (var it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
        carry += (256 * b58[it1]) >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      pbegin++;
    }
    // Skip leading zeroes in base58 result.
    var it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    // Translate the result into a string.
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== 'string') {
      throw new TypeError('Expected String');
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    // Skip leading spaces.
    if (source[psz] === ' ') {
      return;
    }
    // Skip and count leading '1's.
    var zeroes = 0;
    var length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    // Allocate enough space in big-endian base256 representation.
    var size = ((source.length - psz) * FACTOR + 1) >>> 0; // log(58) / log(256), rounded up.
    var b256 = new Uint8Array(size);
    // Process the characters.
    while (source[psz]) {
      // Decode character
      var carry = BASE_MAP[source.charCodeAt(psz)];
      // Invalid character
      if (carry === 255) {
        return;
      }
      var i = 0;
      for (var it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
        carry += (BASE * b256[it3]) >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = (carry / 256) >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      psz++;
    }
    // Skip trailing spaces.
    if (source[psz] === ' ') {
      return;
    }
    // Skip leading zeroes in b256.
    var it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  }
  function decode(string) {
    var buffer = decodeUnsafe(string);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${name} character`);
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode,
  };
}
var src = base;

var _brrp__multiformats_scope_baseX = src;

/**
 * Class represents both BaseEncoder and MultibaseEncoder meaning it
 * can be used to encode to multibase or base encode without multibase
 * prefix.
 *
 * @class
 * @template {string} Base
 * @template {string} Prefix
 * @implements {API.MultibaseEncoder<Prefix>}
 * @implements {API.BaseEncoder}
 */
class Encoder {
  /**
   * @param {Base} name
   * @param {Prefix} prefix
   * @param {(bytes:Uint8Array) => string} baseEncode
   */
  constructor(name, prefix, baseEncode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {API.Multibase<Prefix>}
   */
  encode(bytes) {
    if (bytes instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes)}`;
    } else {
      throw Error('Unknown type, must be binary type');
    }
  }
}

/**
 * @template {string} Prefix
 */
/**
 * Class represents both BaseDecoder and MultibaseDecoder so it could be used
 * to decode multibases (with matching prefix) or just base decode strings
 * with corresponding base encoding.
 *
 * @class
 * @template {string} Base
 * @template {string} Prefix
 * @implements {API.MultibaseDecoder<Prefix>}
 * @implements {API.UnibaseDecoder<Prefix>}
 * @implements {API.BaseDecoder}
 */
class Decoder {
  /**
   * @param {Base} name
   * @param {Prefix} prefix
   * @param {(text:string) => Uint8Array} baseDecode
   */
  constructor(name, prefix, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    /* c8 ignore next 3 */
    if (prefix.codePointAt(0) === undefined) {
      throw new Error('Invalid prefix character');
    }
    /** @private */
    this.prefixCodePoint = /** @type {number} */ (prefix.codePointAt(0));
    this.baseDecode = baseDecode;
  }

  /**
   * @param {string} text
   */
  decode(text) {
    if (typeof text === 'string') {
      if (text.codePointAt(0) !== this.prefixCodePoint) {
        throw Error(
          `Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${
            this.prefix
          }`
        );
      }
      return this.baseDecode(text.slice(this.prefix.length));
    } else {
      throw Error('Can only multibase decode strings');
    }
  }

  /**
   * @template {string} OtherPrefix
   * @param {API.UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
   * @returns {ComposedDecoder<Prefix|OtherPrefix>}
   */
  or(decoder) {
    return or(this, decoder);
  }
}

/**
 * @template {string} Prefix
 * @typedef {Record<Prefix, API.UnibaseDecoder<Prefix>>} Decoders
 */

/**
 * @template {string} Prefix
 * @implements {API.MultibaseDecoder<Prefix>}
 * @implements {API.CombobaseDecoder<Prefix>}
 */
class ComposedDecoder {
  /**
   * @param {Decoders<Prefix>} decoders
   */
  constructor(decoders) {
    this.decoders = decoders;
  }

  /**
   * @template {string} OtherPrefix
   * @param {API.UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
   * @returns {ComposedDecoder<Prefix|OtherPrefix>}
   */
  or(decoder) {
    return or(this, decoder);
  }

  /**
   * @param {string} input
   * @returns {Uint8Array}
   */
  decode(input) {
    const prefix = /** @type {Prefix} */ (input[0]);
    const decoder = this.decoders[prefix];
    if (decoder) {
      return decoder.decode(input);
    } else {
      throw RangeError(
        `Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`
      );
    }
  }
}

/**
 * @template {string} L
 * @template {string} R
 * @param {API.UnibaseDecoder<L>|API.CombobaseDecoder<L>} left
 * @param {API.UnibaseDecoder<R>|API.CombobaseDecoder<R>} right
 * @returns {ComposedDecoder<L|R>}
 */
const or = (left, right) =>
  new ComposedDecoder(
    /** @type {Decoders<L|R>} */ ({
      ...(left.decoders || { [/** @type API.UnibaseDecoder<L> */ (left).prefix]: left }),
      ...(right.decoders || { [/** @type API.UnibaseDecoder<R> */ (right).prefix]: right }),
    })
  );

/**
 * @class
 * @template {string} Base
 * @template {string} Prefix
 * @implements {API.MultibaseCodec<Prefix>}
 * @implements {API.MultibaseEncoder<Prefix>}
 * @implements {API.MultibaseDecoder<Prefix>}
 * @implements {API.BaseCodec}
 * @implements {API.BaseEncoder}
 * @implements {API.BaseDecoder}
 */
class Codec {
  /**
   * @param {Base} name
   * @param {Prefix} prefix
   * @param {(bytes:Uint8Array) => string} baseEncode
   * @param {(text:string) => Uint8Array} baseDecode
   */
  constructor(name, prefix, baseEncode, baseDecode) {
    this.name = name;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name, prefix, baseEncode);
    this.decoder = new Decoder(name, prefix, baseDecode);
  }

  /**
   * @param {Uint8Array} input
   */
  encode(input) {
    return this.encoder.encode(input);
  }

  /**
   * @param {string} input
   */
  decode(input) {
    return this.decoder.decode(input);
  }
}

/**
 * @template {string} Base
 * @template {string} Prefix
 * @param {object} options
 * @param {Base} options.name
 * @param {Prefix} options.prefix
 * @param {(bytes:Uint8Array) => string} options.encode
 * @param {(input:string) => Uint8Array} options.decode
 * @returns {Codec<Base, Prefix>}
 */
const from = ({ name, prefix, encode, decode }) => new Codec(name, prefix, encode, decode);

/**
 * @template {string} Base
 * @template {string} Prefix
 * @param {object} options
 * @param {Base} options.name
 * @param {Prefix} options.prefix
 * @param {string} options.alphabet
 * @returns {Codec<Base, Prefix>}
 */
const baseX = ({ prefix, name, alphabet }) => {
  const { encode, decode } = _brrp__multiformats_scope_baseX(alphabet, name);
  return from({
    prefix,
    name,
    encode,
    /**
     * @param {string} text
     */
    decode: text => coerce(decode(text)),
  });
};

/**
 * @param {string} string
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @param {string} name
 * @returns {Uint8Array}
 */
const decode = (string, alphabet, bitsPerChar, name) => {
  // Build the character lookup table:
  /** @type {Record<string, number>} */
  const codes = {};
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i;
  }

  // Count the padding bytes:
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;
  }

  // Allocate the output:
  const out = new Uint8Array(((end * bitsPerChar) / 8) | 0);

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError(`Non-${name} character`);
    }

    // Append the bits to the buffer:
    buffer = (buffer << bitsPerChar) | value;
    bits += bitsPerChar;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= bitsPerChar || 0xff & (buffer << (8 - bits))) {
    throw new SyntaxError('Unexpected end of data');
  }

  return out;
};

/**
 * @param {Uint8Array} data
 * @param {string} alphabet
 * @param {number} bitsPerChar
 * @returns {string}
 */
const encode = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === '=';
  const mask = (1 << bitsPerChar) - 1;
  let out = '';

  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  for (let i = 0; i < data.length; ++i) {
    // Slurp data into the buffer:
    buffer = (buffer << 8) | data[i];
    bits += 8;

    // Write out as much as we can:
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & (buffer >> bits)];
    }
  }

  // Partial character:
  if (bits) {
    out += alphabet[mask & (buffer << (bitsPerChar - bits))];
  }

  // Add padding characters until we hit a byte boundary:
  if (pad) {
    while ((out.length * bitsPerChar) & 7) {
      out += '=';
    }
  }

  return out;
};

/**
 * RFC4648 Factory
 *
 * @template {string} Base
 * @template {string} Prefix
 * @param {object} options
 * @param {Base} options.name
 * @param {Prefix} options.prefix
 * @param {string} options.alphabet
 * @param {number} options.bitsPerChar
 */
const rfc4648 = ({ name, prefix, bitsPerChar, alphabet }) => {
  return from({
    prefix,
    name,
    encode(input) {
      return encode(input, alphabet, bitsPerChar);
    },
    decode(input) {
      return decode(input, alphabet, bitsPerChar, name);
    },
  });
};

const base58btc = baseX({
  name: 'base58btc',
  prefix: 'z',
  alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
});

baseX({
  name: 'base58flickr',
  prefix: 'Z',
  alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
});

const base32 = rfc4648({
  prefix: 'b',
  name: 'base32',
  alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'B',
  name: 'base32upper',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'c',
  name: 'base32pad',
  alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'C',
  name: 'base32padupper',
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'v',
  name: 'base32hex',
  alphabet: '0123456789abcdefghijklmnopqrstuv',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'V',
  name: 'base32hexupper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 't',
  name: 'base32hexpad',
  alphabet: '0123456789abcdefghijklmnopqrstuv=',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'T',
  name: 'base32hexpadupper',
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
  bitsPerChar: 5,
});

rfc4648({
  prefix: 'h',
  name: 'base32z',
  alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
  bitsPerChar: 5,
});

/**
 * @template {API.Link<unknown, number, number, API.Version>} T
 * @template {string} Prefix
 * @param {T} link
 * @param {API.MultibaseEncoder<Prefix>} [base]
 * @returns {API.ToString<T, Prefix>}
 */
const format = (link, base) => {
  const { bytes, version } = link;
  switch (version) {
    case 0:
      return toStringV0(bytes, baseCache(link), /** @type {API.MultibaseEncoder<"z">} */ (base) || base58btc.encoder);
    default:
      return toStringV1(bytes, baseCache(link), /** @type {API.MultibaseEncoder<Prefix>} */ (base || base32.encoder));
  }
};

/** @type {WeakMap<API.UnknownLink, Map<string, string>>} */
const cache = new WeakMap();

/**
 * @param {API.UnknownLink} cid
 * @returns {Map<string, string>}
 */
const baseCache = cid => {
  const baseCache = cache.get(cid);
  if (baseCache == null) {
    const baseCache = new Map();
    cache.set(cid, baseCache);
    return baseCache;
  }
  return baseCache;
};

/**
 * @template {unknown} [Data=unknown]
 * @template {number} [Format=number]
 * @template {number} [Alg=number]
 * @template {API.Version} [Version=API.Version]
 * @implements {API.Link<Data, Format, Alg, Version>}
 */

class CID {
  /**
   * @param {Version} version - Version of the CID
   * @param {Format} code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param {API.MultihashDigest<Alg>} multihash - (Multi)hash of the of the content.
   * @param {Uint8Array} bytes
   *
   */
  constructor(version, code, multihash, bytes) {
    /** @readonly */
    this.code = code;
    /** @readonly */
    this.version = version;
    /** @readonly */
    this.multihash = multihash;
    /** @readonly */
    this.bytes = bytes;

    // flag to serializers that this is a CID and
    // should be treated specially
    /** @readonly */
    this['/'] = bytes;
  }

  /**
   * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
   * please either use `CID.asCID(cid)` or switch to new signalling mechanism
   *
   * @deprecated
   */
  get asCID() {
    return this;
  }

  // ArrayBufferView
  get byteOffset() {
    return this.bytes.byteOffset;
  }

  // ArrayBufferView
  get byteLength() {
    return this.bytes.byteLength;
  }

  /**
   * @returns {CID<Data, API.DAG_PB, API.SHA_256, 0>}
   */
  toV0() {
    switch (this.version) {
      case 0: {
        return /** @type {CID<Data, API.DAG_PB, API.SHA_256, 0>} */ (this);
      }
      case 1: {
        const { code, multihash } = this;

        if (code !== DAG_PB_CODE) {
          throw new Error('Cannot convert a non dag-pb CID to CIDv0');
        }

        // sha2-256
        if (multihash.code !== SHA_256_CODE) {
          throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0');
        }

        return /** @type {CID<Data, API.DAG_PB, API.SHA_256, 0>} */ (
          CID.createV0(/** @type {API.MultihashDigest<API.SHA_256>} */ (multihash))
        );
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
      }
    }
  }

  /**
   * @returns {CID<Data, Format, Alg, 1>}
   */
  toV1() {
    switch (this.version) {
      case 0: {
        const { code, digest } = this.multihash;
        const multihash = create(code, digest);
        return /** @type {CID<Data, Format, Alg, 1>} */ (CID.createV1(this.code, multihash));
      }
      case 1: {
        return /** @type {CID<Data, Format, Alg, 1>} */ (this);
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
      }
    }
  }

  /**
   * @param {unknown} other
   * @returns {other is CID<Data, Format, Alg, Version>}
   */
  equals(other) {
    return CID.equals(this, other);
  }

  /**
   * @template {unknown} Data
   * @template {number} Format
   * @template {number} Alg
   * @template {API.Version} Version
   * @param {API.Link<Data, Format, Alg, Version>} self
   * @param {unknown} other
   * @returns {other is CID}
   */
  static equals(self, other) {
    const unknown = /** @type {{code?:unknown, version?:unknown, multihash?:unknown}} */ (other);
    return unknown && self.code === unknown.code && self.version === unknown.version && equals(self.multihash, unknown.multihash);
  }

  /**
   * @param {API.MultibaseEncoder<string>} [base]
   * @returns {string}
   */
  toString(base) {
    return format(this, base);
  }

  toJSON() {
    return {
      code: this.code,
      version: this.version,
      hash: this.multihash.bytes,
    };
  }

  link() {
    return this;
  }

  get [Symbol.toStringTag]() {
    return 'CID';
  }

  // Legacy

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `CID(${this.toString()})`;
  }

  /**
   * Takes any input `value` and returns a `CID` instance if it was
   * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
   * it will return value back. If `value` is not instance of this CID
   * class, but is compatible CID it will return new instance of this
   * `CID` class. Otherwise returs null.
   *
   * This allows two different incompatible versions of CID library to
   * co-exist and interop as long as binary interface is compatible.
   *
   * @template {unknown} Data
   * @template {number} Format
   * @template {number} Alg
   * @template {API.Version} Version
   * @template {unknown} U
   * @param {API.Link<Data, Format, Alg, Version>|U} input
   * @returns {CID<Data, Format, Alg, Version>|null}
   */
  static asCID(input) {
    if (input == null) {
      return null;
    }

    const value = /** @type {any} */ (input);
    if (value instanceof CID) {
      // If value is instance of CID then we're all set.
      return value;
    } else if ((value['/'] != null && value['/'] === value.bytes) || value.asCID === value) {
      // If value isn't instance of this CID class but `this.asCID === this` or
      // `value['/'] === value.bytes` is true it is CID instance coming from a
      // different implementation (diff version or duplicate). In that case we
      // rebase it to this `CID` implementation so caller is guaranteed to get
      // instance with expected API.
      const { version, code, multihash, bytes } = value;
      return new CID(
        version,
        code,
        /** @type {API.MultihashDigest<Alg>} */ (multihash),
        bytes || encodeCID(version, code, multihash.bytes)
      );
    } else if (value[cidSymbol] === true) {
      // If value is a CID from older implementation that used to be tagged via
      // symbol we still rebase it to the this `CID` implementation by
      // delegating that to a constructor.
      const { version, multihash, code } = value;
      const digest =
        /** @type {API.MultihashDigest<Alg>} */
        (decode$1(multihash));
      return CID.create(version, code, digest);
    } else {
      // Otherwise value is not a CID (or an incompatible version of it) in
      // which case we return `null`.
      return null;
    }
  }

  /**
   *
   * @template {unknown} Data
   * @template {number} Format
   * @template {number} Alg
   * @template {API.Version} Version
   * @param {Version} version - Version of the CID
   * @param {Format} code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param {API.MultihashDigest<Alg>} digest - (Multi)hash of the of the content.
   * @returns {CID<Data, Format, Alg, Version>}
   */
  static create(version, code, digest) {
    if (typeof code !== 'number') {
      throw new Error('String codecs are no longer supported');
    }

    if (!(digest.bytes instanceof Uint8Array)) {
      throw new Error('Invalid digest');
    }

    switch (version) {
      case 0: {
        if (code !== DAG_PB_CODE) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
        } else {
          return new CID(version, code, digest, digest.bytes);
        }
      }
      case 1: {
        const bytes = encodeCID(version, code, digest.bytes);
        return new CID(version, code, digest, bytes);
      }
      default: {
        throw new Error('Invalid version');
      }
    }
  }

  /**
   * Simplified version of `create` for CIDv0.
   *
   * @template {unknown} [T=unknown]
   * @param {API.MultihashDigest<typeof SHA_256_CODE>} digest - Multihash.
   * @returns {CID<T, typeof DAG_PB_CODE, typeof SHA_256_CODE, 0>}
   */
  static createV0(digest) {
    return CID.create(0, DAG_PB_CODE, digest);
  }

  /**
   * Simplified version of `create` for CIDv1.
   *
   * @template {unknown} Data
   * @template {number} Code
   * @template {number} Alg
   * @param {Code} code - Content encoding format code.
   * @param {API.MultihashDigest<Alg>} digest - Miltihash of the content.
   * @returns {CID<Data, Code, Alg, 1>}
   */
  static createV1(code, digest) {
    return CID.create(1, code, digest);
  }

  /**
   * Decoded a CID from its binary representation. The byte array must contain
   * only the CID with no additional bytes.
   *
   * An error will be thrown if the bytes provided do not contain a valid
   * binary representation of a CID.
   *
   * @template {unknown} Data
   * @template {number} Code
   * @template {number} Alg
   * @template {API.Version} Ver
   * @param {API.ByteView<API.Link<Data, Code, Alg, Ver>>} bytes
   * @returns {CID<Data, Code, Alg, Ver>}
   */
  static decode(bytes) {
    const [cid, remainder] = CID.decodeFirst(bytes);
    if (remainder.length) {
      throw new Error('Incorrect length');
    }
    return cid;
  }

  /**
   * Decoded a CID from its binary representation at the beginning of a byte
   * array.
   *
   * Returns an array with the first element containing the CID and the second
   * element containing the remainder of the original byte array. The remainder
   * will be a zero-length byte array if the provided bytes only contained a
   * binary CID representation.
   *
   * @template {unknown} T
   * @template {number} C
   * @template {number} A
   * @template {API.Version} V
   * @param {API.ByteView<API.Link<T, C, A, V>>} bytes
   * @returns {[CID<T, C, A, V>, Uint8Array]}
   */
  static decodeFirst(bytes) {
    const specs = CID.inspectBytes(bytes);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error('Incorrect length');
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid =
      specs.version === 0 ? CID.createV0(/** @type {API.MultihashDigest<API.SHA_256>} */ (digest)) : CID.createV1(specs.codec, digest);
    return [/** @type {CID<T, C, A, V>} */ (cid), bytes.subarray(specs.size)];
  }

  /**
   * Inspect the initial bytes of a CID to determine its properties.
   *
   * Involves decoding up to 4 varints. Typically this will require only 4 to 6
   * bytes but for larger multicodec code values and larger multihash digest
   * lengths these varints can be quite large. It is recommended that at least
   * 10 bytes be made available in the `initialBytes` argument for a complete
   * inspection.
   *
   * @template {unknown} T
   * @template {number} C
   * @template {number} A
   * @template {API.Version} V
   * @param {API.ByteView<API.Link<T, C, A, V>>} initialBytes
   * @returns {{ version:V, codec:C, multihashCode:A, digestSize:number, multihashSize:number, size:number }}
   */
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length] = decode$2(initialBytes.subarray(offset));
      offset += length;
      return i;
    };

    let version = /** @type {V} */ (next());
    let codec = /** @type {C} */ (DAG_PB_CODE);
    if (/** @type {number} */ (version) === 18) {
      // CIDv0
      version = /** @type {V} */ (0);
      offset = 0;
    } else {
      codec = /** @type {C} */ (next());
    }

    if (version !== 0 && version !== 1) {
      throw new RangeError(`Invalid CID version ${version}`);
    }

    const prefixSize = offset;
    const multihashCode = /** @type {A} */ (next()); // multihash code
    const digestSize = next(); // multihash length
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;

    return { version, codec, multihashCode, digestSize, multihashSize, size };
  }

  /**
   * Takes cid in a string representation and creates an instance. If `base`
   * decoder is not provided will use a default from the configuration. It will
   * throw an error if encoding of the CID is not compatible with supplied (or
   * a default decoder).
   *
   * @template {string} Prefix
   * @template {unknown} Data
   * @template {number} Code
   * @template {number} Alg
   * @template {API.Version} Ver
   * @param {API.ToString<API.Link<Data, Code, Alg, Ver>, Prefix>} source
   * @param {API.MultibaseDecoder<Prefix>} [base]
   * @returns {CID<Data, Code, Alg, Ver>}
   */
  static parse(source, base) {
    const [prefix, bytes] = parseCIDtoBytes(source, base);

    const cid = CID.decode(bytes);

    // Cache string representation to avoid computing it on `this.toString()`
    baseCache(cid).set(prefix, source);

    return cid;
  }
}

/**
 * @template {string} Prefix
 * @template {unknown} Data
 * @template {number} Code
 * @template {number} Alg
 * @template {API.Version} Ver
 * @param {API.ToString<API.Link<Data, Code, Alg, Ver>, Prefix>} source
 * @param {API.MultibaseDecoder<Prefix>} [base]
 * @returns {[Prefix, API.ByteView<API.Link<Data, Code, Alg, Ver>>]}
 */
const parseCIDtoBytes = (source, base) => {
  switch (source[0]) {
    // CIDv0 is parsed differently
    case 'Q': {
      const decoder = base || base58btc;
      return [/** @type {Prefix} */ (base58btc.prefix), decoder.decode(`${base58btc.prefix}${source}`)];
    }
    case base58btc.prefix: {
      const decoder = base || base58btc;
      return [/** @type {Prefix} */ (base58btc.prefix), decoder.decode(source)];
    }
    case base32.prefix: {
      const decoder = base || base32;
      return [/** @type {Prefix} */ (base32.prefix), decoder.decode(source)];
    }
    default: {
      if (base == null) {
        throw Error('To parse non base32 or base58btc encoded CID multibase decoder must be provided');
      }
      return [/** @type {Prefix} */ (source[0]), base.decode(source)];
    }
  }
};

/**
 *
 * @param {Uint8Array} bytes
 * @param {Map<string, string>} cache
 * @param {API.MultibaseEncoder<'z'>} base
 */
const toStringV0 = (bytes, cache, base) => {
  const { prefix } = base;
  if (prefix !== base58btc.prefix) {
    throw Error(`Cannot string encode V0 in ${base.name} encoding`);
  }

  const cid = cache.get(prefix);
  if (cid == null) {
    const cid = base.encode(bytes).slice(1);
    cache.set(prefix, cid);
    return cid;
  } else {
    return cid;
  }
};

/**
 * @template {string} Prefix
 * @param {Uint8Array} bytes
 * @param {Map<string, string>} cache
 * @param {API.MultibaseEncoder<Prefix>} base
 */
const toStringV1 = (bytes, cache, base) => {
  const { prefix } = base;
  const cid = cache.get(prefix);
  if (cid == null) {
    const cid = base.encode(bytes);
    cache.set(prefix, cid);
    return cid;
  } else {
    return cid;
  }
};

const DAG_PB_CODE = 0x70;
const SHA_256_CODE = 0x12;

/**
 * @param {API.Version} version
 * @param {number} code
 * @param {Uint8Array} multihash
 * @returns {Uint8Array}
 */
const encodeCID = (version, code, multihash) => {
  const codeOffset = encodingLength(version);
  const hashOffset = codeOffset + encodingLength(code);
  const bytes = new Uint8Array(hashOffset + multihash.byteLength);
  encodeTo(version, bytes, 0);
  encodeTo(code, bytes, codeOffset);
  bytes.set(multihash, hashOffset);
  return bytes;
};

const cidSymbol = Symbol.for('@ipld/js-cid/CID');

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const get = function (url) {
  try {
    return Promise.resolve(
      fetch__default['default'](url, {
        mode: 'cors',
      })
    ).then(function (res) {
      if (res.status >= 400) {
        throw new Error(`Bad response ${res.statusText}`);
      }

      return res.json();
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }

        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }

    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }

    pact.s = state;
    pact.v = value;
    const observer = pact.o;

    if (observer) {
      observer(pact);
    }
  }
}

const DOC_PATH = '/.well-known/did.json';

const _Pact = /*#__PURE__*/ (function () {
  function _Pact() {}

  _Pact.prototype.then = function (onFulfilled, onRejected) {
    const result = new _Pact();
    const state = this.s;

    if (state) {
      const callback = state & 1 ? onFulfilled : onRejected;

      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }

        return result;
      } else {
        return this;
      }
    }

    this.o = function (_this) {
      try {
        const value = _this.v;

        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };

    return result;
  };

  return _Pact;
})();

function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}

function _do(body, test) {
  var awaitBody;

  do {
    var result = body();

    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.v;
      } else {
        awaitBody = true;
        break;
      }
    }

    var shouldContinue = test();

    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }

    if (!shouldContinue) {
      return result;
    }
  } while (!shouldContinue.then);

  const pact = new _Pact();

  const reject = _settle.bind(null, pact, 2);

  (awaitBody ? result.then(_resumeAfterBody) : shouldContinue.then(_resumeAfterTest)).then(void 0, reject);
  return pact;

  function _resumeAfterBody(value) {
    result = value;

    for (;;) {
      shouldContinue = test();

      if (_isSettledPact(shouldContinue)) {
        shouldContinue = shouldContinue.v;
      }

      if (!shouldContinue) {
        break;
      }

      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }

      result = body();

      if (result && result.then) {
        if (_isSettledPact(result)) {
          result = result.v;
        } else {
          result.then(_resumeAfterBody).then(void 0, reject);
          return;
        }
      }
    }

    _settle(pact, 1, result);
  }

  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      do {
        result = body();

        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_resumeAfterBody).then(void 0, reject);
            return;
          }
        }

        shouldContinue = test();

        if (_isSettledPact(shouldContinue)) {
          shouldContinue = shouldContinue.v;
        }

        if (!shouldContinue) {
          _settle(pact, 1, result);

          return;
        }
      } while (!shouldContinue.then);

      shouldContinue.then(_resumeAfterTest).then(void 0, reject);
    } else {
      _settle(pact, 1, result);
    }
  }
}

const ARC3_NAME_SUFFIX = '@arc3';
const ARC3_URL_SUFFIX = '#arc3';
const METADATA_FILE = 'metadata.json';
const JSON_TYPE = 'application/json';
const server = 'https://node.algoexplorerapi.io/';
const port = '';
const token = ''; // const server = "https://testnet-algorand.api.purestake.io/ps2";

new algosdk__default['default'].Algodv2(token, server, port);
let algodIndexerClient = new algosdk__default['default'].Indexer('', 'https://node.testnet.algoexplorerapi.io', ''); //let algodIndexerClient = new algosdk.Indexer(token, "https://algoindexer.algoexplorerapi.io/", "");

function resolveProtocol(url, reserveAddr) {
  if (url.endsWith(ARC3_URL_SUFFIX)) url = url.slice(0, url.length - ARC3_URL_SUFFIX.length);
  const chunks = url.split('://');
  console.log('resolve protocol:', url);
  console.log(chunks); // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be

  if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
    // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
    chunks[0] = 'ipfs';
    const cidComponents = chunks[1].split(':');

    if (cidComponents.length !== 5) {
      // give up
      console.log('unknown ipfscid format');
      return url;
    }

    const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents; // const cidVersionInt = parseInt(cidVersion) as CIDVersion

    if (cidHash.split('}')[0] !== 'sha2-256') {
      console.log('unsupported hash:', cidHash);
      return url;
    }

    if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
      console.log('unsupported codec:', cidCodec);
      return url;
    }

    if (asaField !== 'reserve') {
      console.log('unsupported asa field:', asaField);
      return url;
    }

    let cidCodecCode = 0x55;

    if (cidCodec === 'raw') {
      cidCodecCode = 0x55;
    } else if (cidCodec === 'dag-pb') {
      cidCodecCode = 0x70;
    } // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash

    const addr = algosdk.decodeAddress(reserveAddr);
    const mhdigest = create(0x12, addr.publicKey);
    const cid = CID.create(parseInt(cidVersion, 10), cidCodecCode, mhdigest);
    console.log('switching to id:', cid.toString());
    chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/');
    console.log('redirecting to ipfs:', chunks[1]);
  } // No protocol specified, give up

  if (chunks.length < 2) return url; //  Switch on the protocol

  switch (chunks[0]) {
    case 'ipfs':
      //  Its ipfs, use the configured gateway
      //return conf[activeConf].ipfsGateway + chunks[1];
      return 'https://ipfs.io/ipfs/' + chunks[1];

    case 'https':
      //  Its already http, just return it
      return url;

    default:
      return '';
    // TODO: Future options may include arweave or algorand
  }
}

function getResolver() {
  const resolve = function (did, parsed) {
    try {
      console.log(did);
      let err = null;
      let path = decodeURIComponent(parsed.id) + DOC_PATH;
      const id = parsed.id.split(':');

      if (id.length > 1) {
        path = id.map(decodeURIComponent).join('/');
      } //identifier will be the DID, i.e., did:algo-nft:asaID

      let assetUrl;
      let didDocument = null;
      const didDocumentMetadata = {};

      try {
        const chunks = did.split(':');
        return Promise.resolve(algodIndexerClient.lookupAssetByID(parseInt(chunks[2], 10)).do()).then(function (assetInfo) {
          let _interrupt;

          console.log(assetInfo);
          const url = resolveProtocol('template-ipfs://{ipfscid:1:raw:reserve:sha2-256}', assetInfo.params.reserve);

          const _temp3 = _do(
            function () {
              function _temp2() {
                if (!_interrupt) {
                  // TODO: this excludes the use of query params
                  const docIdMatchesDid = didDocument?.id === did;

                  if (!docIdMatchesDid) {
                    err = 'resolver_error: DID document id does not match requested did'; // break // uncomment this when adding more checks
                  }
                }
              }

              const _temp = _catch(
                function () {
                  return Promise.resolve(get(url)).then(function (_get) {
                    didDocument = _get;
                    console.log(didDocument);
                  });
                },
                function (error) {
                  err = `resolver_error: DID must resolve to a valid https URL containing a JSON document: ${error}`;
                  _interrupt = 1;
                }
              );

              return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp); // eslint-disable-next-line no-constant-condition
            },
            function () {
              return !_interrupt && false;
            }
          );

          if (_temp3 && _temp3.then) return _temp3.then(function () {});
        });
      } catch (e) {
        Promise.reject(e);
      }

      const contentType = typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json';

      if (err) {
        return Promise.resolve({
          didDocument,
          didDocumentMetadata,
          didResolutionMetadata: {
            error: 'notFound',
            message: err,
          },
        });
      } else {
        return Promise.resolve({
          didDocument,
          didDocumentMetadata,
          didResolutionMetadata: {
            contentType,
          },
        });
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return {
    algoNFT: resolve,
  };
}

exports.ARC3_NAME_SUFFIX = ARC3_NAME_SUFFIX;
exports.ARC3_URL_SUFFIX = ARC3_URL_SUFFIX;
exports.JSON_TYPE = JSON_TYPE;
exports.METADATA_FILE = METADATA_FILE;
exports.getResolver = getResolver;
//# sourceMappingURL=resolver.cjs.map
