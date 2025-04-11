export function encodePricingData(message) {
  let bb = popByteBuffer();
  _encodePricingData(message, bb);
  return toUint8Array(bb);
}

function _encodePricingData(message, bb) {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional float price = 2;
  let $price = message.price;
  if ($price !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $price);
  }

  // optional sint64 time = 3;
  let $time = message.time;
  if ($time !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64ZigZag(bb, $time);
  }

  // optional string currency = 4;
  let $currency = message.currency;
  if ($currency !== undefined) {
    writeVarint32(bb, 34);
    writeString(bb, $currency);
  }

  // optional string exchange = 5;
  let $exchange = message.exchange;
  if ($exchange !== undefined) {
    writeVarint32(bb, 42);
    writeString(bb, $exchange);
  }

  // optional QuoteType quoteType = 6;
  let $quoteType = message.quoteType;
  if ($quoteType !== undefined) {
    writeVarint32(bb, 50);
    let nested = popByteBuffer();
    _encodeQuoteType($quoteType, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional MarketHoursType marketHours = 7;
  let $marketHours = message.marketHours;
  if ($marketHours !== undefined) {
    writeVarint32(bb, 58);
    let nested = popByteBuffer();
    _encodeMarketHoursType($marketHours, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional float changePercent = 8;
  let $changePercent = message.changePercent;
  if ($changePercent !== undefined) {
    writeVarint32(bb, 69);
    writeFloat(bb, $changePercent);
  }

  // optional sint64 dayVolume = 9;
  let $dayVolume = message.dayVolume;
  if ($dayVolume !== undefined) {
    writeVarint32(bb, 72);
    writeVarint64ZigZag(bb, $dayVolume);
  }

  // optional float dayHigh = 10;
  let $dayHigh = message.dayHigh;
  if ($dayHigh !== undefined) {
    writeVarint32(bb, 85);
    writeFloat(bb, $dayHigh);
  }

  // optional float dayLow = 11;
  let $dayLow = message.dayLow;
  if ($dayLow !== undefined) {
    writeVarint32(bb, 93);
    writeFloat(bb, $dayLow);
  }

  // optional float change = 12;
  let $change = message.change;
  if ($change !== undefined) {
    writeVarint32(bb, 101);
    writeFloat(bb, $change);
  }

  // optional string shortName = 13;
  let $shortName = message.shortName;
  if ($shortName !== undefined) {
    writeVarint32(bb, 106);
    writeString(bb, $shortName);
  }

  // optional sint64 expireDate = 14;
  let $expireDate = message.expireDate;
  if ($expireDate !== undefined) {
    writeVarint32(bb, 112);
    writeVarint64ZigZag(bb, $expireDate);
  }

  // optional float openPrice = 15;
  let $openPrice = message.openPrice;
  if ($openPrice !== undefined) {
    writeVarint32(bb, 125);
    writeFloat(bb, $openPrice);
  }

  // optional float previousClose = 16;
  let $previousClose = message.previousClose;
  if ($previousClose !== undefined) {
    writeVarint32(bb, 133);
    writeFloat(bb, $previousClose);
  }

  // optional float strikePrice = 17;
  let $strikePrice = message.strikePrice;
  if ($strikePrice !== undefined) {
    writeVarint32(bb, 141);
    writeFloat(bb, $strikePrice);
  }

  // optional string underlyingSymbol = 18;
  let $underlyingSymbol = message.underlyingSymbol;
  if ($underlyingSymbol !== undefined) {
    writeVarint32(bb, 146);
    writeString(bb, $underlyingSymbol);
  }

  // optional sint64 openInterest = 19;
  let $openInterest = message.openInterest;
  if ($openInterest !== undefined) {
    writeVarint32(bb, 152);
    writeVarint64ZigZag(bb, $openInterest);
  }

  // optional OptionType optionsType = 20;
  let $optionsType = message.optionsType;
  if ($optionsType !== undefined) {
    writeVarint32(bb, 162);
    let nested = popByteBuffer();
    _encodeOptionType($optionsType, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional sint64 miniOption = 21;
  let $miniOption = message.miniOption;
  if ($miniOption !== undefined) {
    writeVarint32(bb, 168);
    writeVarint64ZigZag(bb, $miniOption);
  }

  // optional sint64 lastSize = 22;
  let $lastSize = message.lastSize;
  if ($lastSize !== undefined) {
    writeVarint32(bb, 176);
    writeVarint64ZigZag(bb, $lastSize);
  }

  // optional float bid = 23;
  let $bid = message.bid;
  if ($bid !== undefined) {
    writeVarint32(bb, 189);
    writeFloat(bb, $bid);
  }

  // optional sint64 bidSize = 24;
  let $bidSize = message.bidSize;
  if ($bidSize !== undefined) {
    writeVarint32(bb, 192);
    writeVarint64ZigZag(bb, $bidSize);
  }

  // optional float ask = 25;
  let $ask = message.ask;
  if ($ask !== undefined) {
    writeVarint32(bb, 205);
    writeFloat(bb, $ask);
  }

  // optional sint64 askSize = 26;
  let $askSize = message.askSize;
  if ($askSize !== undefined) {
    writeVarint32(bb, 208);
    writeVarint64ZigZag(bb, $askSize);
  }

  // optional sint64 priceHint = 27;
  let $priceHint = message.priceHint;
  if ($priceHint !== undefined) {
    writeVarint32(bb, 216);
    writeVarint64ZigZag(bb, $priceHint);
  }

  // optional sint64 vol_24hr = 28;
  let $vol_24hr = message.vol_24hr;
  if ($vol_24hr !== undefined) {
    writeVarint32(bb, 224);
    writeVarint64ZigZag(bb, $vol_24hr);
  }

  // optional sint64 volAllCurrencies = 29;
  let $volAllCurrencies = message.volAllCurrencies;
  if ($volAllCurrencies !== undefined) {
    writeVarint32(bb, 232);
    writeVarint64ZigZag(bb, $volAllCurrencies);
  }

  // optional string fromCurrency = 30;
  let $fromCurrency = message.fromCurrency;
  if ($fromCurrency !== undefined) {
    writeVarint32(bb, 242);
    writeString(bb, $fromCurrency);
  }

  // optional string lastMarket = 31;
  let $lastMarket = message.lastMarket;
  if ($lastMarket !== undefined) {
    writeVarint32(bb, 250);
    writeString(bb, $lastMarket);
  }

  // optional double circulatingSupply = 32;
  let $circulatingSupply = message.circulatingSupply;
  if ($circulatingSupply !== undefined) {
    writeVarint32(bb, 257);
    writeDouble(bb, $circulatingSupply);
  }

  // optional double marketcap = 33;
  let $marketcap = message.marketcap;
  if ($marketcap !== undefined) {
    writeVarint32(bb, 265);
    writeDouble(bb, $marketcap);
  }
}

export function decodePricingData(binary) {
  return _decodePricingData(wrapByteBuffer(binary));
}

function _decodePricingData(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional float price = 2;
      case 2: {
        message.price = readFloat(bb);
        break;
      }

      // optional sint64 time = 3;
      case 3: {
        message.time = readVarint64ZigZag(bb);
        break;
      }

      // optional string currency = 4;
      case 4: {
        message.currency = readString(bb, readVarint32(bb));
        break;
      }

      // optional string exchange = 5;
      case 5: {
        message.exchange = readString(bb, readVarint32(bb));
        break;
      }

      // optional QuoteType quoteType = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        message.quoteType = _decodeQuoteType(bb);
        bb.limit = limit;
        break;
      }

      // optional MarketHoursType marketHours = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        message.marketHours = _decodeMarketHoursType(bb);
        bb.limit = limit;
        break;
      }

      // optional float changePercent = 8;
      case 8: {
        message.changePercent = readFloat(bb);
        break;
      }

      // optional sint64 dayVolume = 9;
      case 9: {
        message.dayVolume = readVarint64ZigZag(bb);
        break;
      }

      // optional float dayHigh = 10;
      case 10: {
        message.dayHigh = readFloat(bb);
        break;
      }

      // optional float dayLow = 11;
      case 11: {
        message.dayLow = readFloat(bb);
        break;
      }

      // optional float change = 12;
      case 12: {
        message.change = readFloat(bb);
        break;
      }

      // optional string shortName = 13;
      case 13: {
        message.shortName = readString(bb, readVarint32(bb));
        break;
      }

      // optional sint64 expireDate = 14;
      case 14: {
        message.expireDate = readVarint64ZigZag(bb);
        break;
      }

      // optional float openPrice = 15;
      case 15: {
        message.openPrice = readFloat(bb);
        break;
      }

      // optional float previousClose = 16;
      case 16: {
        message.previousClose = readFloat(bb);
        break;
      }

      // optional float strikePrice = 17;
      case 17: {
        message.strikePrice = readFloat(bb);
        break;
      }

      // optional string underlyingSymbol = 18;
      case 18: {
        message.underlyingSymbol = readString(bb, readVarint32(bb));
        break;
      }

      // optional sint64 openInterest = 19;
      case 19: {
        message.openInterest = readVarint64ZigZag(bb);
        break;
      }

      // optional OptionType optionsType = 20;
      case 20: {
        let limit = pushTemporaryLength(bb);
        message.optionsType = _decodeOptionType(bb);
        bb.limit = limit;
        break;
      }

      // optional sint64 miniOption = 21;
      case 21: {
        message.miniOption = readVarint64ZigZag(bb);
        break;
      }

      // optional sint64 lastSize = 22;
      case 22: {
        message.lastSize = readVarint64ZigZag(bb);
        break;
      }

      // optional float bid = 23;
      case 23: {
        message.bid = readFloat(bb);
        break;
      }

      // optional sint64 bidSize = 24;
      case 24: {
        message.bidSize = readVarint64ZigZag(bb);
        break;
      }

      // optional float ask = 25;
      case 25: {
        message.ask = readFloat(bb);
        break;
      }

      // optional sint64 askSize = 26;
      case 26: {
        message.askSize = readVarint64ZigZag(bb);
        break;
      }

      // optional sint64 priceHint = 27;
      case 27: {
        message.priceHint = readVarint64ZigZag(bb);
        break;
      }

      // optional sint64 vol_24hr = 28;
      case 28: {
        message.vol_24hr = readVarint64ZigZag(bb);
        break;
      }

      // optional sint64 volAllCurrencies = 29;
      case 29: {
        message.volAllCurrencies = readVarint64ZigZag(bb);
        break;
      }

      // optional string fromCurrency = 30;
      case 30: {
        message.fromCurrency = readString(bb, readVarint32(bb));
        break;
      }

      // optional string lastMarket = 31;
      case 31: {
        message.lastMarket = readString(bb, readVarint32(bb));
        break;
      }

      // optional double circulatingSupply = 32;
      case 32: {
        message.circulatingSupply = readDouble(bb);
        break;
      }

      // optional double marketcap = 33;
      case 33: {
        message.marketcap = readDouble(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

function pushTemporaryLength(bb) {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb, type) {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value) {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value) {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value) {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack = [];

function popByteBuffer() {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb) {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes) {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb) {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb, offset) {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb) {
  return bb.offset >= bb.limit;
}

function grow(bb, count) {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb, count) {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb, count) {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb, buffer) {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb, count) {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2, c3, c4, c;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb, text) {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb, buffer) {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb) {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb, value) {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb) {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb, value) {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb) {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb, value) {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb) {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb, value) {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb, unsigned) {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb, value) {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb) {
  let c = 0;
  let value = 0;
  let b;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb, value) {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb, unsigned) {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb, value) {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb) {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb, value) {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb) {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb, value) {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
