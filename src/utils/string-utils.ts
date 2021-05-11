import shajs from "sha.js";

export class StringUtils {
   private constructor() {}

   /**
    * Converts string into camelCase.
    *
    * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
    */
   public static camelCase(str: string, firstCapital: boolean = false): string {
      return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
         if (firstCapital === true && offset === 0) return p1;
         if (p2) return p2.toUpperCase();
         return p1.toLowerCase();
      });
   }

   /**
    * Converts string into snake_case.
    *
    * @see https://regex101.com/r/QeSm2I/1
    */
   public static snakeCase(str: string) {
      return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, "$1_$3$2$4").toLowerCase();
   }

   /**
    * Converts string into Title Case.
    *
    * @see http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    */
   public static titleCase(str: string): string {
      return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
   }

   /**
    * Builds abbreviated string from given string;
    */
   public static abbreviate(str: string, abbrLettersCount: number = 1): string {
      const words = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2").split(" ");
      return words.reduce((res, word) => {
         res += word.substr(0, abbrLettersCount);
         return res;
      }, "");
   }

   /**
    * Shorten a given `input`. Useful for RDBMS imposing a limit on the
    * maximum length of aliases and column names in SQL queries.
    *
    * @param input String to be shortened.
    * @param options Default to `4` for segments length, `2` for terms length, `'__'` as a separator.
    *
    * @return Shortened `input`.
    *
    * @example
    * // returns: "UsShCa__orde__mark__dire"
    * shorten('UserShoppingCart__order__market__director')
    *
    * // returns: "cat_wit_ver_lon_nam_pos_wit_ver_lon_nam_pos_wit_ver_lon_nam"
    * shorten(
    *   'category_with_very_long_name_posts_with_very_long_name_post_with_very_long_name',
    *   { separator: '_', segmentLength: 3 }
    * )
    *
    * // equals: UsShCa__orde__mark_market_id
    * `${shorten('UserShoppingCart__order__market')}_market_id`
    */
   public static shorten(input: string, options: IShortenOptions = {}): string {
      const { segmentLength = 4, separator = "__", termLength = 2 } = options;

      const segments = input.split(separator);
      const shortSegments = segments.reduce((acc: string[], val: string) => {
         // split the given segment into many terms based on an eventual camel cased name
         const segmentTerms = val.replace(/([a-z\xE0-\xFF])([A-Z\xC0-\xDF])/g, "$1 $2").split(" ");
         // "OrderItemList" becomes "OrItLi", while "company" becomes "comp"
         const length = segmentTerms.length > 1 ? termLength : segmentLength;
         const shortSegment = segmentTerms.map(term => term.substr(0, length)).join("");

         acc.push(shortSegment);
         return acc;
      }, []);

      return shortSegments.join(separator);
   }

   /**
    * Returns a hashed input.
    *
    * @param input String to be hashed.
    * @param options.length Optionally, shorten the output to desired length.
    */
   public static hash(input: string, options: IHashOptions = {}): string {
      const hashFunction = shajs("sha256");

      hashFunction.update(input, "utf8");

      const hashedInput = hashFunction.digest("hex");

      if (options.length) {
         return hashedInput.slice(0, options.length);
      }

      return hashedInput;
   }
   
   /**
    *  discuss at: http://locutus.io/php/sha1/
    * original by: Webtoolkit.info (http://www.webtoolkit.info/)
    * improved by: Michael White (http://getsprink.com)
    * improved by: Kevin van Zonneveld (http://kvz.io)
    *    input by: Brett Zamir (http://brett-zamir.me)
    *      note 1: Keep in mind that in accordance with PHP, the whole string is buffered and then
    *      note 1: hashed. If available, we'd recommend using Node's native crypto modules directly
    *      note 1: in a steaming fashion for faster and more efficient hashing
    *   example 1: sha1('Kevin van Zonneveld')
    *   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
    */
    public static sha1(str: string) {

      let _rotLeft = function (n: any, s: any) {
         let t4 = (n << s) | (n >>> (32 - s));
         return t4;
      };

      let _cvtHex = function (val: any) {
         let str = "";
         let i;
         let v;

         for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
         }
         return str;
      };

      let blockstart;
      let i, j;
      let W = new Array(80);
      let H0 = 0x67452301;
      let H1 = 0xEFCDAB89;
      let H2 = 0x98BADCFE;
      let H3 = 0x10325476;
      let H4 = 0xC3D2E1F0;
      let A, B, C, D, E;
      let temp;

      // utf8_encode
      str = /*unescape*/(encodeURIComponent(str));
      let strLen = str.length;

      let wordArray = [];
      for (i = 0; i < strLen - 3; i += 4) {
         j = str.charCodeAt(i) << 24 |
            str.charCodeAt(i + 1) << 16 |
            str.charCodeAt(i + 2) << 8 |
            str.charCodeAt(i + 3);
         wordArray.push(j);
      }

      switch (strLen % 4) {
         case 0:
            i = 0x080000000;
            break;
         case 1:
            i = str.charCodeAt(strLen - 1) << 24 | 0x0800000;
            break;
         case 2:
            i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000;
            break;
         case 3:
            i = str.charCodeAt(strLen - 3) << 24 |
               str.charCodeAt(strLen - 2) << 16 |
               str.charCodeAt(strLen - 1) <<
               8 | 0x80;
            break;
      }

      wordArray.push(i);

      while ((wordArray.length % 16) !== 14) {
         wordArray.push(0);
      }

      wordArray.push(strLen >>> 29);
      wordArray.push((strLen << 3) & 0x0ffffffff);

      for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
         for (i = 0; i < 16; i++) {
            W[i] = wordArray[blockstart + i];
         }
         for (i = 16; i <= 79; i++) {
            W[i] = _rotLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
         }

         A = H0;
         B = H1;
         C = H2;
         D = H3;
         E = H4;

         for (i = 0; i <= 19; i++) {
            temp = (_rotLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = _rotLeft(B, 30);
            B = A;
            A = temp;
         }

         for (i = 20; i <= 39; i++) {
            temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = _rotLeft(B, 30);
            B = A;
            A = temp;
         }

         for (i = 40; i <= 59; i++) {
            temp = (_rotLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = _rotLeft(B, 30);
            B = A;
            A = temp;
         }

         for (i = 60; i <= 79; i++) {
            temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = _rotLeft(B, 30);
            B = A;
            A = temp;
         }

         H0 = (H0 + A) & 0x0ffffffff;
         H1 = (H1 + B) & 0x0ffffffff;
         H2 = (H2 + C) & 0x0ffffffff;
         H3 = (H3 + D) & 0x0ffffffff;
         H4 = (H4 + E) & 0x0ffffffff;
      }

      temp = _cvtHex(H0) + _cvtHex(H1) + _cvtHex(H2) + _cvtHex(H3) + _cvtHex(H4);
      return temp.toLowerCase();
   }
}

export interface IShortenOptions {
   /** String used to split "segments" of the alias/column name */
   separator?: string;
   /** Maximum length of any "segment" */
   segmentLength?: number;
   /** Length of any "term" in a "segment"; "OrderItem" is a segment, "Order" and "Items" are terms */
   termLength?: number;
}

export interface IShortenOptions {
   /** String used to split "segments" of the alias/column name */
   separator?: string;
   /** Maximum length of any "segment" */
   segmentLength?: number;
   /** Length of any "term" in a "segment"; "OrderItem" is a segment, "Order" and "Items" are terms */
   termLength?: number;
}

interface IHashOptions {
   length?: number;
}