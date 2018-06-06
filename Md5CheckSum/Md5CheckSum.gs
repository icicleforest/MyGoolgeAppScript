// https://ja.wikipedia.org/wiki/MD5

var Md5CheckSum = function(message) {
  // 各ワードに加算する値テーブル
  this.K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];

  // 初期値
  this.A0 = 0x67452301;
  this.B0 = 0xefcdab89;
  this.C0 = 0x98badcfe;
  this.D0 = 0x10325476;

  // ビットローテート量テーブル
  this.S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  // 計算後のメッセージダイジェスト
  this.bytesDigest = [];

  // 入力バイト列  
  var bytesMessage = [].concat(message);

  // 入力が文字列だった場合バイト列に変換
  if(typeof message === "string") {
    bytesMessage = [];
    for(var i = 0; i < message.length; ++i) {
      bytesMessage.push(message.charCodeAt(i) & 0xFF);
      // TODO: UTF-8対応
    }
  }
    
  // パディング
  var bitlenOriginal = bytesMessage.length * 8; // メッセージ長
  var bitlenOriginalL64bit = Math.floor(bitlenOriginal % Math.pow(2, 64)); // メッセージ長の下位64bit
  var bitlenPadding = (448 - (bitlenOriginal % 512)); // パディング長
  if(bitlenPadding <= 0) {
    bitlenPadding += 512;
  }
  var bytelenPadding = Math.floor(bitlenPadding / 8);
  for(var i = 0; i < bytelenPadding; ++i) {
    if(i == 0) {
      bytesMessage.push(0x80);
    }
    else {
      bytesMessage.push(0x00);
    }
  }
  // メッセージ長64bit表現を32bitに分割して扱う
  var wordsBitlenOriginalL64bit = [
    bitlenOriginalL64bit % Math.pow(2, 32),
    Math.floor(bitlenOriginalL64bit / Math.pow(2, 32)) % Math.pow(2, 32)
  ];
  for(var i = 0; i < wordsBitlenOriginalL64bit.length; ++i) {
    for(var j = 0; j < 4; ++j) {
      bytesMessage.push((wordsBitlenOriginalL64bit[i] >>> (8 * j)) & 0xFF);
    }
  }

  // メッセージダイジェスト計算
  var numBlocks = Math.floor(bytesMessage.length / 64);
  for(var x = 0; x < bytesMessage.length; x += 64) {
    var M = []; // 32bitブロック単位に再分割
    for(var j = x; j < x + 64; j += 4) {
      var val = 0;
      for(var i = 0; i < 4; ++i) {
        val |= (((bytesMessage[j + i] + 256) % 256) << (8 * i));
      }
      M.push(val);
    }
    var A = this.A0;
    var B = this.B0;
    var C = this.C0;
    var D = this.D0;
    for(var i = 0; i < 64; ++i) {
      var F = 0;
      var g = 0;
      if(i < 16) {
        F = (B & C) | ((~ B) & D);
        g = i;
      }
      else if(i < 32) {
        F = (D & B) | ((~ D) & C);
        g = (5 * i + 1) % 16;
      }
      else if(i < 48) {
        F = (B ^ C) ^ D;
        g = (3 * i + 5) % 16;
      }
      else {
        F = C ^ (B | (~ D));
        g = (7 * i) % 16;
      }
      
      var tempD = D;
      var pat = ((A + F + this.K[i] + M[g]) + Math.pow(2, 32)) % Math.pow(2, 32);
      D = C;
      C = B;
      B = B + ((pat << this.S[i]) | (pat >>> (32 - this.S[i])));
      A = tempD;
    }
    this.A0 = (this.A0 + A + Math.pow(2, 32)) % Math.pow(2, 32);
    this.B0 = (this.B0 + B + Math.pow(2, 32)) % Math.pow(2, 32);
    this.C0 = (this.C0 + C + Math.pow(2, 32)) % Math.pow(2, 32);
    this.D0 = (this.D0 + D + Math.pow(2, 32)) % Math.pow(2, 32);
  }
  
  var wordsDigest = [this.A0, this.B0, this.C0, this.D0];
  for(var i = 0; i < wordsDigest.length; ++i) {
    for(var j = 0; j < 4; ++j) {
      this.bytesDigest.push((wordsDigest[i] >>> (8 * j)) & 0xFF);
    }
  }
};


Md5CheckSum.prototype.getBytes = function() {
  return [].concat(this.bytesDigest);
};


Md5CheckSum.prototype.getHexString = function() {
  var desc = "";
  for(var i = 0; i < this.bytesDigest.length; ++i) {
    desc += (Math.floor((this.bytesDigest[i] % 256) / 16)).toString(16) + "" + (this.bytesDigest[i] % 16).toString(16);
  }
  return desc;
};


Md5CheckSum.prototype.getBase64String = function() {
  var desc = "";
  var tokens = [];
  for(var i = 0; i < this.bytesDigest.length; ++i) {
    switch(i % 3) {
      case 0:
        tokens.push(this.bytesDigest[i] >>> 2);
        break;
      case 1:
        tokens.push(((this.bytesDigest[i - 1] & 0x03) << 4) | (this.bytesDigest[i] >>> 4));
        break;
      case 2:
        tokens.push(((this.bytesDigest[i - 1] & 0x0F) << 2) | (this.bytesDigest[i] >>> 6));
        tokens.push(this.bytesDigest[i] & 0x3F);
        break;
    }
  }
  
  switch(this.bytesDigest.length % 3) {
    case 0:
      break;
    case 1:
      tokens.push((this.bytesDigest[this.bytesDigest.length - 1] & 0x03) << 4);
      break;
    case 2:
      tokens.push((this.bytesDigest[this.bytesDigest.length - 1] & 0x0F) << 2);
      break;
  }
  
  for(var i = 0; i < tokens.length; ++i) {
    desc += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[tokens[i % 64]];
  }

  while(desc.length % 4) {
    desc += "=";
  }
  
  return desc;
};


/**
 * TEST
 */
function Md5CheckSum_test() {
  var testcases = [
    {
      "original_data": "A",
      "expected_result": "7fc56270e7a70fa81a5935b72eacbe29"
    },
    {
      "original_data": "B",
      "expected_result": "9d5ed678fe57bcca610140957afab571"
    },
    {
      "original_data": "1234567890",
      "expected_result": "e807f1fcf82d132f9bb018ca6738a19f"
    },
    {
      "original_data": [31, -117, 8, 0, 0, 0, 0, 0, 0, 0, 51, 52, 50, 54, 49, 53, 51, -73, -80, 52, -32, 2, 0, -54, 13, -111, -30, 11, 0, 0, 0],
      "expected_result": "fd13c4b0dddc90ebb9c60a415e0b899b"
    },
    {
      "original_data": "000000000000000000000000000",
      "expected_result": "780ca685003cec1d617beaa6f346e1be"
    },
    {
      "original_data": [31, -117, 8, 0, 0, 0, 0, 0, 0, 0, 51, 48, -64, 9, 0, -68, 16, 103, -127, 27, 0, 0, 0],
      "expected_result": "999fa5ae3eb28df85f514649b70416b8"
    },
    {
      "original_data": function() {
        var file = null;
        var iter = DriveApp.getFilesByName("wrong-long-file.gz");
        if(iter.hasNext()) {
          file = iter.next();
        }
        return file.getBlob().getBytes();
      },
      "expected_result": "ec887673d5356f576d366f6114f3a86b"
    }
  ];
  
  for(var i = 0; i < testcases.length; ++i) {
    var input = testcases[i]["original_data"];
    if(typeof(input) === "function") {
      input = input();
    }
    
    var result = testcases[i]["expected_result"];
    var output = new Md5CheckSum(input);
    var resultByGoogle = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input, Utilities.Charset.UTF_8));
    
    Logger.log("TEST: " + input);
    Logger.log("RESULT1: " + output.getHexString() + " == " + result +  " (" + (result == output.getHexString()) + ")");
    if(typeof(input) === "string") {
      Logger.log("RESULT2: " + output.getBase64String() + " == " + resultByGoogle + " ( " + (resultByGoogle == output.getBase64String()) + ")");
    }
    Logger.log(output.getBase64String() + " <= " + output.getBytes());
    Logger.log("");
  }
}

